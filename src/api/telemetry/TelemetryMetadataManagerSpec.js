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

import TelemetryMetadataManager from './TelemetryMetadataManager.js';

describe('TelemetryMetadataManager', () => {
  let metadata;

  beforeEach(() => {
    metadata = {
      values: [
        {
          key: 'utc',
          name: 'Time',
          hints: { x: 1 }
        },
        {
          key: 'value',
          name: 'Value',
          hints: { y: 2 }
        }
      ]
    };
  });

  it('does not mutate the source value metadata or hints', () => {
    const expected = JSON.parse(JSON.stringify(metadata));
    const sourceValues = metadata.values.slice();
    const sourceHints = metadata.values.map((value) => value.hints);

    const manager = new TelemetryMetadataManager(metadata);

    expect(manager.valueMetadatas.length).toBe(2);

    expect(metadata).toEqual(expected);
    metadata.values.forEach((value, index) => {
      expect(value).toBe(sourceValues[index]);
      expect(value.hints).toBe(sourceHints[index]);
      expect(value.source).toBeUndefined();
      expect(value.hints.priority).toBeUndefined();
    });
  });

  it('applies defaults to its own value metadatas', () => {
    const manager = new TelemetryMetadataManager(metadata);

    expect(manager.valueMetadatas.length).toBe(2);
    expect(manager.valueMetadatas[0].source).toBe('utc');
    expect(manager.valueMetadatas[0].hints).toEqual({ domain: 1, priority: 0 });
    expect(manager.valueMetadatas[1].source).toBe('value');
    expect(manager.valueMetadatas[1].hints).toEqual({ range: 2, priority: 1 });
  });
});
