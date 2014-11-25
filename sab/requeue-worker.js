var id;			        // Identity
var L;				// Next location to sleep on, incremented
var M;				// Location to count in, constant
var i32a;			// SharedInt32Array
var numworkers;
var iter;

onmessage = 
    function (ev) {
	if (!ev.data)
	    return;
	var msg = ev.data;
	id = msg.id;
	L = msg.L;
	M = msg.M;
	var memory = msg.memory;
	numworkers = msg.numworkers;
	iter = msg.numiter;
	i32a = new SharedInt32Array(memory);
	console.log("Running " + id);
	setTimeout(compute, 0);
    };

function compute() {
    while (iter--) {
	v = Atomics.futexWait(i32a, L, 0, Number.POSITIVE_INFINITY);
	console.log("HI FROM WORKER " + id);
	i32a[M]++;
	L = (L+1) % numworkers;
    }
}
