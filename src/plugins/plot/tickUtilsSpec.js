/*****************************************************************************
 * Open MCT, Copyright (c) 2014-2024, United States Government
 * as represented by the Administrator of the National Aeronautics and Space
 * Administration. All rights reserved.
 *
 * Open MCT is licensed under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 *
 * Open MCT includes source code licensed under additional open source
 * licenses. See the Open Source Licenses file (LICENSES.md) included with
 * this source code distribution or the Licensing information page available
 * at runtime from the About dialog for additional information.
 *****************************************************************************/

import { getLogTicks, getTicksFittingLength, getTimeTicks, ticks, toTick } from './tickUtils.js';

describe('getTicksFittingLength', () => {
  const MIN_SPACING = 20;
  const DESIRED_COUNT = 6;
  const range = { min: 0, max: 100 };
  function generateLinearTicks(count) {
    return ticks(range.min, range.max, count).map(toTick);
  }

  function fit(length, tickRange = range, generateTicks = generateLinearTicks) {
    return getTicksFittingLength(generateTicks, DESIRED_COUNT, tickRange, length, MIN_SPACING);
  }

  function getValues(fittedTicks) {
    return fittedTicks.filter((tick) => !tick.minor).map((tick) => tick.value);
  }

  it('leaves ticks unchanged when there is plenty of room', () => {
    expect(fit(400)).toEqual(generateLinearTicks(DESIRED_COUNT));
  });

  it('leaves ticks unchanged when they just fit', () => {
    const fullTicks = generateLinearTicks(DESIRED_COUNT);

    expect(fit(fullTicks.length * MIN_SPACING)).toEqual(fullTicks);
  });

  it('regenerates fewer human readable ticks as space shrinks', () => {
    const narrowRange = { min: 0, max: 8 };
    function generateNarrowTicks(count) {
      return ticks(narrowRange.min, narrowRange.max, count).map(toTick);
    }

    expect(getValues(fit(200, narrowRange, generateNarrowTicks)).length).toBe(9);
    expect(getValues(fit(100, narrowRange, generateNarrowTicks))).toEqual([0, 2, 4, 6, 8]);
  });

  it('never returns more labelled ticks than fit', () => {
    for (let length = 20; length <= 400; length += 5) {
      const maxCount = Math.max(2, Math.floor(length / MIN_SPACING) + 1);

      expect(getValues(fit(length)).length).not.toBeGreaterThan(maxCount);
    }
  });

  it('never lets ticks closer than the minimum spacing remain', () => {
    for (let length = 40; length <= 400; length += 5) {
      const values = getValues(fit(length));
      const gaps = values.slice(1).map((value, i) => ((value - values[i]) / 100) * length);

      expect(Math.min(...gaps)).not.toBeLessThan(MIN_SPACING);
    }
  });

  it('judges uneven ticks by their real spacing, not their count', () => {
    const unevenTicks = [0, 5, 100].map(toTick);

    const fitted = getTicksFittingLength(() => unevenTicks, 6, range, 400, MIN_SPACING);

    expect(getValues(fitted)).toEqual([0, 5, 100]);
    expect(getValues(getTicksFittingLength(() => unevenTicks, 6, range, 100, MIN_SPACING))).toEqual(
      [0, 100]
    );
  });

  it('never returns fewer than two ticks', () => {
    for (const length of [1, 10, 19, 20, 39]) {
      expect(getValues(fit(length)).length).toBe(2);
    }
  });

  it('keeps the upper and lower ticks when only two fit', () => {
    expect(getValues(fit(30))).toEqual([0, 100]);
  });

  it('shows upper, lower and middle ticks when three fit', () => {
    // 50 is not a tick at this scale, so the nearest to the center is used
    expect(getValues(fit(60))).toEqual([0, 40, 100]);
  });

  it('keeps the outermost human readable values rather than the raw range bounds', () => {
    const paddedRange = { min: -3, max: 103 };
    function generatePaddedTicks(count) {
      return ticks(paddedRange.min, paddedRange.max, count).map(toTick);
    }

    expect(getValues(fit(30, paddedRange, generatePaddedTicks))).toEqual([0, 100]);
  });

  it('picks the tick nearest the center as the middle tick, even if off center', () => {
    const offCenterRange = { min: 0, max: 70 };
    function generateOffCenterTicks(count) {
      return ticks(offCenterRange.min, offCenterRange.max, count).map(toTick);
    }

    const values = getValues(fit(60, offCenterRange, generateOffCenterTicks));

    expect(values.length).toBe(3);
    expect(values[0]).toBe(0);
    expect(values[2]).toBe(70);
    expect(values[1]).toBe(30);
  });

  it('hides the middle tick if it would overrun the lower tick', () => {
    // The only interior tick (5) sits 5px above the lower tick
    const fixedTicks = [0, 5, 100].map(toTick);
    const fixedRange = { min: 0, max: 100 };

    const fitted = getTicksFittingLength(() => fixedTicks, 6, fixedRange, 100, MIN_SPACING);

    expect(getValues(fitted)).toEqual([0, 100]);
  });

  it('hides the middle tick if it would overrun the upper tick', () => {
    const fixedTicks = [0, 95, 100].map(toTick);
    const fixedRange = { min: 0, max: 100 };

    const fitted = getTicksFittingLength(() => fixedTicks, 6, fixedRange, 40, MIN_SPACING);

    expect(getValues(fitted)).toEqual([0, 100]);
  });

  it('keeps the middle tick when it clears both ends by exactly the minimum spacing', () => {
    const fixedTicks = [0, 20, 100].map(toTick);
    const fixedRange = { min: 0, max: 100 };

    const fitted = getTicksFittingLength(() => fixedTicks, 6, fixedRange, 100, MIN_SPACING);

    expect(getValues(fitted)).toEqual([0, 20, 100]);
  });

  it('does not show a middle tick when the middle tick would be too close to an end', () => {
    const fixedTicks = [0, 50, 100].map(toTick);
    const fixedRange = { min: 0, max: 100 };

    const fitted = getTicksFittingLength(() => fixedTicks, 6, fixedRange, 39, MIN_SPACING);

    expect(getValues(fitted)).toEqual([0, 100]);
  });

  it('returns a lone tick unchanged', () => {
    const fixedRange = { min: 0, max: 100 };

    const fitted = getTicksFittingLength(() => [toTick(50)], 6, fixedRange, 10, MIN_SPACING);

    expect(getValues(fitted)).toEqual([50]);
  });

  it('works with negative and fractional ranges', () => {
    const smallRange = { min: -0.5, max: 0.5 };
    function generateSmallTicks(count) {
      return ticks(smallRange.min, smallRange.max, count).map(toTick);
    }

    expect(getValues(fit(60, smallRange, generateSmallTicks))).toEqual([-0.4, 0, 0.4]);
    expect(getValues(fit(30, smallRange, generateSmallTicks))).toEqual([-0.4, 0.4]);
  });

  it('requests the desired count first and never a count below the minimum', () => {
    const requestedCounts = [];
    function recordingGenerator(count) {
      requestedCounts.push(count);

      return generateLinearTicks(count);
    }

    getTicksFittingLength(recordingGenerator, DESIRED_COUNT, range, 40, MIN_SPACING);

    expect(requestedCounts[0]).toBe(DESIRED_COUNT);
    expect(Math.min(...requestedCounts.slice(0, -1))).toBe(4);
  });

  describe('with time ticks', () => {
    const start = Date.UTC(2026, 0, 1);
    const timeRange = { min: start, max: start + 60 * 60 * 1000 };

    function generateTimeTicks(count) {
      return getTimeTicks(timeRange.min, timeRange.max, count).map(toTick);
    }

    it('reduces to the upper and lower ticks when space is tight', () => {
      const fitted = fit(30, timeRange, generateTimeTicks);

      expect(fitted.length).toBe(2);
      expect(fitted[0].value).toBe(generateTimeTicks(DESIRED_COUNT)[0].value);
    });

    it('leaves ticks unchanged when there is room', () => {
      expect(fit(1000, timeRange, generateTimeTicks)).toEqual(generateTimeTicks(DESIRED_COUNT));
    });
  });

  describe('with log ticks', () => {
    const logRange = { min: 0, max: 6 };
    function generateLogTicks(count) {
      return getLogTicks(logRange.min, logRange.max, count);
    }

    it('drops gridline-only minor ticks when reduced to bounds and middle', () => {
      const fitted = fit(30, logRange, generateLogTicks);

      expect(fitted.every((tick) => !tick.minor)).toBeTrue();
      expect(fitted.length).toBe(2);
    });

    it('keeps the unlabelled minor ticks when nothing needs reducing', () => {
      const fitted = fit(1000, logRange, generateLogTicks);

      expect(fitted).toEqual(generateLogTicks(DESIRED_COUNT));
    });

    it('keeps data values on the reduced ticks so labels stay exact', () => {
      const fitted = fit(30, logRange, generateLogTicks);

      for (const tick of fitted) {
        expect(tick.dataValue).toBeDefined();
      }
    });
  });
});
