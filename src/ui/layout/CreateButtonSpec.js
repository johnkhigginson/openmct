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

import CreateButton from './CreateButton.vue';

describe('CreateButton', () => {
  let context;

  beforeEach(() => {
    const typeDefinitions = {
      zebra: { name: 'Zebra', creatable: true },
      hidden: { name: 'Hidden', creatable: false },
      apple: { name: 'Apple', creatable: true }
    };

    context = {
      openmct: {
        types: {
          listKeys: () => Object.keys(typeDefinitions),
          get: (key) => ({ definition: typeDefinitions[key] })
        }
      },
      create() {}
    };
    context.getItems = CreateButton.methods.getItems.bind(context);
    Object.freeze(context);
  });

  it('sorts only the creatable types by name without mutating component state', () => {
    const sortedItems = CreateButton.computed.sortedItems.call(context);

    expect(sortedItems.map((item) => item.name)).toEqual(['Apple', 'Zebra']);
  });
});
