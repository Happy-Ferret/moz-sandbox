/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var buffer = new ArrayBuffer(65536);

// The asm-to-wasm translator performs no constant folding so literal
// OP literal tests actually test code generation for OP.

// ============================================================

function m_and_literals(stdlib, ffi, heap) {
    "use asm";

    function f() {
	return (37 & 42)|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_and_literals), true);
    let { f } = m_and_literals(this, {}, buffer);
    assertEq(f(), 37 & 42);
}

function m_and_global_literal(stdlib, ffi, heap) {
    "use asm";

    var g = 37;

    function f() {
	return (g & 42)|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_and_global_literal), true);
    let { f } = m_and_global_literal(this, {}, buffer);
    assertEq(f(), 37 & 42);
}

// ============================================================

function m_or_literals(stdlib, ffi, heap) {
    "use asm";

    function f() {
	return (37 | 42)|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_or_literals), true);
    let { f } = m_or_literals(this, {}, buffer);
    assertEq(f(), 37 | 42);
}

function m_or_global_literal(stdlib, ffi, heap) {
    "use asm";

    var g = 37;

    function f() {
	return (g | 42)|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_or_global_literal), true);
    let { f } = m_or_global_literal(this, {}, buffer);
    assertEq(f(), 37 | 42);
}

// ============================================================

function m_xor_literals(stdlib, ffi, heap) {
    "use asm";

    function f() {
	return (37 ^ 42)|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_xor_literals), true);
    let { f } = m_xor_literals(this, {}, buffer);
    assertEq(f(), 37 ^ 42);
}

function m_xor_global_literal(stdlib, ffi, heap) {
    "use asm";

    var g = 37;

    function f() {
	return (g ^ 42)|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_xor_global_literal), true);
    let { f } = m_xor_global_literal(this, {}, buffer);
    assertEq(f(), 37 ^ 42);
}

// ============================================================

function m_not_literal(stdlib, ffi, heap) {
    "use asm";

    function f() {
	return (~37)|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_not_literal), true);
    let { f } = m_not_literal(this, {}, buffer);
    assertEq(f(), ~37);
}

function m_not_global(stdlib, ffi, heap) {
    "use asm";

    var g = 37;

    function f() {
	return (~g)|0;
    }
    return { f:f };
}

{
    assertEq(isAsmJSModule(m_not_global), true);
    let { f } = m_not_global(this, {}, buffer);
    assertEq(f(), ~37);
}

// ============================================================
//
// TODO: shift operations, need better code generation for that

