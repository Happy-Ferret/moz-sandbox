# ReferenceMap

The WebAssembly host-bindings proposal could use a simple facility for weakly held objects and finalization: it is useful for wrapping C++/Rust/whatever libraries that are compiled to wasm and wrapped in a JS interface.  In this case, there will be an address in the wasm heap representing an important program object, and a JS facade object (trying to avoid the overloaded term "proxy" here) that knows that address.  The problem is then twofold: when the JS facade is GC'd we would want to run some wasm code to destruct the wasm representation; and when wasm calls out to JS passing it a pointer (or when wasm returns a pointer to a JS caller) we want to map that pointer to the existing JS object, so that there can be a single facade per important wasm program object.

Instead of opening up the Pandora's box that is weak refs and finalization in JS, and likely having to deal with what we might want for a future wasm-GC solution as well, we can provide a solution that is narrowly tailored to the host-binding use cases.

The proposal, `WebAssembly.ReferenceMap`, maps int32 keys to weakly held JS object values and allows the keys to be recovered when the objects have been collected.

## ReferenceMap Proposal

### Overview

The new type `WebAssembly.ReferenceMap` [1] maps wasm i32 values to JS Object instances [2], [3].  It's a "normal" type: there can be many instances of it per agent, and it is garbage-collectable.

A ReferenceMap instance has two internal properties: `[[Mapping]]` is a list of `(i,object)` pairs where the `i` values are unique i32 values, while `[[Inaccessible]]` is a list of unique i32 values.  No i32 value appears in both lists.

In each entry `(i,object)` in `[[Mapping]]` the `object` is held weakly.  When `object` is no longer visible to JS, the entry is removed from `[[Mapping]]` and the `i` value is inserted into the `[[Inaccessible]]` list.  The two lists may be updated only between turns or when the `reap()` method is called [4], [5].

#### Constructor `WebAssembly.ReferenceMap`

Constructs a new ReferenceMap:

1. Create and return a new `ReferenceMap` instance.

#### `WebAssembly.ReferenceMap.prototype.put(i, object)`

Inserts a mapping into the ReferenceMap:

1. Let `k` = ToNumber(`i`)
1. If ToInt32(`k`) != `k` or if `object` is not an Object, then throw a TypeError.
1. If the mapping `(k,v)` is in this object's `[[Mapping]]` for any `v`, or if `k` is in this object's `[[Inaccessible]]`, then throw a ReferenceError.
1. Otherwise, insert `(k,object)` into this object's `[[Mapping]]`.

#### `WebAssembly.ReferenceMap.prototype.get(i)`

Retrieves a mapping from the ReferenceMap:

1. Let `k` = ToNumber(`i`)
1. If ToInt32(`k`) != `k` then throw a TypeError.
1. If there is an entry `(k,object)` in this object's `[[Mapping]]` then return `object`.
1. If `k` is in this object's `[[Inaccessible]]` then return `null`.
1. Otherwise return `undefined`.

#### `WebAssembly.ReferenceMap.prototype.delete(i)`

Removes a mapping from the ReferenceMap:

1. Let `k` = ToNumber(`i`)
1. If ToInt32(`k`) != `k` then throw a TypeError.
1. If there is an entry `(k,v)` in this object's `[[Mapping]]` for any `v` then remove that entry and return `true`.
1. If `k` is in this object's `[[Inaccessible]]` then remove it and return `true`.
1. Otherwise return `false`.

#### `WebAssembly.ReferenceMap.prototype.reap()`

Retrieves the keys for dead objects from the ReferenceMap:

1. Let A be a new Array [6].
1. Copy the values from this object's `[[Inaccessible]]` into A.
1. Set this object's `[[Inaccessible]]` to an empty list.
1. Return A.

### Discussion

The intended usage pattern is that the application will do periodic housekeeping, during which it checks whether there are objects to reap; if so it will perform some action to deallocate the wasm storage for each of the values in the inaccessible set.  Most reasonably the housekeeping would be done by an interval event or occasionally in response to other events. [7]

ReferenceMaps combine Lispy weak-value-eq-hash-maps with Guardians [8].  They make it possible to observe GC timing and thus will be a source of incompatible-across-implementations behavior.  They can also be used to implement finalizers in JS (provided those finalizers need not reference the object being finalized), but in a way that is benign: the application must itself run the finalizers, they are not run by the GC.

There are no restrictions on whether objects can be registered with multiple ReferenceMaps under the same or different keys.  (Indeed ReferenceMaps are themselves objects and can be entered into ReferenceMaps.)  Such complex uses may require the application to track liveness of the wasm resources with eg reference counts.  Common single-threaded use cases will likely not need such machinery.

### Notes

[1] Nobody is wedded to the name `ReferenceMap`, or indeed, to any names at all.  Bikeshed away.

[2] Really we want the map to be able to use any wasm value as a key, but JS does not play well with int64 yet, and there's a question about what the equality is of the i32 `1` and the f64 `1.0`.  So for now restrict this to i32 until we resolve those issues.

[3] We could allow any JS value, but since Object instances have identity and are mutable and it is obvious what it means to GC them then it's useful for now to restrict the values to Object (and Object subtype) instances.

[4] Were it not for this rule, concurrent GC could lead us to a situation where code checks that a mapping is in the set, runs for a while, and then attempts to grab the object from the set only to find that the mapping has been removed.  The JS WeakRef proposal calls this a multiple-use hazard and requires WeakRefs to be resolved between turns only.  By providing a special case for `r.reap()`, we make it possible in principle for code to manage resources without returning to the event loop, a likely common case for wasm multithreaded code.

[5] Semantically an object held in a JS `WeakMap` or `WeakSet` can only become unreferenced between turns and we do not propose that `reap()` change that behavior.
  
[6] Returning an Array may not be the most efficient method; we can imagine other APIs, either returning a single value (with `undefined` acting as a sentinel), or filling in an existing Array or TypedArray.

[7] It's possible that convenience methods on the ReferenceMap could be used to poll it cheaply to see if cleanup work is needed.  Or it could be that some kind of promise API is useful here, with a promise to be resolved when there are new references in the inaccessible set.

[8] https://www.cs.indiana.edu/~dyb/pubs/guardians-pldi93.pdf
