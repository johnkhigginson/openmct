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
import { createOpenMct, resetApplicationState } from '../../utils/testing.js';

describe('The Overlay API', () => {
  let openmct;
  let overlay;

  beforeEach((done) => {
    openmct = createOpenMct();
    openmct.on('start', done);
    openmct.startHeadless(document.createElement('div'));
  });

  afterEach(() => {
    overlay?.dismiss();

    return resetApplicationState(openmct);
  });

  describe('overlay buttons', () => {
    let buttons;

    beforeEach(() => {
      overlay = openmct.overlays.overlay({
        element: document.createElement('div'),
        size: 'small',
        buttons: [
          { label: 'Ok', emphasis: true, callback: () => {} },
          { label: 'Cancel', callback: () => {} }
        ]
      });
      document.body.appendChild(overlay.container);
      buttons = overlay.container.querySelectorAll('.js-overlay__button');
    });

    afterEach(() => {
      overlay.container.remove();
    });

    it('styles only the emphasized button as major', () => {
      expect(buttons[0].classList.contains('c-button--major')).toBeTrue();
      expect(buttons[1].classList.contains('c-button--major')).toBeFalse();
    });

    it('keeps the emphasized button major when another button has focus', async () => {
      buttons[1].dispatchEvent(new Event('focus'));
      await new Promise((resolve) => setTimeout(resolve));

      expect(buttons[0].classList.contains('c-button--major')).toBeTrue();
      expect(buttons[1].classList.contains('c-button--major')).toBeFalse();
    });
  });
});
