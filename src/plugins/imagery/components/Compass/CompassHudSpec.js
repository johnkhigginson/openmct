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

import CompassHud from './CompassHud.vue';

describe('CompassHud', () => {
  function getVisibleCompassPoints(visibleRange) {
    return CompassHud.computed.visibleCompassPoints.call({ visibleRange });
  }

  it('does not share point styles between evaluations', () => {
    const firstPoints = getVisibleCompassPoints([350, 10]);
    const northStyleBefore = { ...firstPoints.find((point) => point.direction === 'N').style };

    const secondPoints = getVisibleCompassPoints([345, 5]);

    const northStyleAfter = firstPoints.find((point) => point.direction === 'N').style;
    expect(northStyleAfter).toEqual(northStyleBefore);
    expect(secondPoints.find((point) => point.direction === 'N').style).not.toEqual(
      northStyleBefore
    );
  });
});
