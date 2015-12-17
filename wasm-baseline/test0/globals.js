/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var buffer = new ArrayBuffer(65536);

// Very basic tests for global variables, other tests depend on these
// passing.

// ============================================================

function m_global_get(stdlib, ffi, heap) {
    "use asm";

    var g = 37;

    function f() {
	return g|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_global_get), true);
    let { f } = m_global_get(this, {}, buffer);
    assertEq(f(), 37);
}

// ============================================================

function m_global_setget(stdlib, ffi, heap) {
    "use asm";

    var g = 37;

    function f() {
	g = 42;
	return g|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_global_setget), true);
    let { f } = m_global_setget(this, {}, buffer);
    assertEq(f(), 42);
}