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

import AnnotationsCanvas from './AnnotationsCanvas.vue';

describe('AnnotationsCanvas', () => {
  const KEY_STRING = 'some-image';
  let context;

  beforeEach(() => {
    context = {
      keyString: KEY_STRING,
      imageryAnnotations: [
        { targets: [{ keyString: KEY_STRING, rectangle: { x: 0, y: 0, width: 10, height: 10 } }] },
        { targets: [{ keyString: KEY_STRING, rectangle: { x: 50, y: 50, width: 10, height: 10 } }] }
      ],
      transformRectangleToPixelDense: AnnotationsCanvas.methods.transformRectangleToPixelDense,
      transformAnnotationRectangleToFlatbushRectangle:
        AnnotationsCanvas.methods.transformAnnotationRectangleToFlatbushRectangle
    };
    Object.freeze(context);
  });

  it('builds the index without mutating component state', () => {
    const annotationsIndex = AnnotationsCanvas.computed.annotationsIndex.call(context);
    const scale = window.devicePixelRatio;
    const foundIndices = annotationsIndex.search(55 * scale, 55 * scale, 55 * scale, 55 * scale);

    expect(foundIndices.map((index) => context.imageryAnnotations[index])).toEqual([
      context.imageryAnnotations[1]
    ]);
  });
});
