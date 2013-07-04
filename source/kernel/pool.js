(function (enyo) {

	// internally maintain a pool of objects to reuse whenever possible
	// to prevent the memory footprint expansion forcing the GC to execute more
	// often
	var pool = [], claimed = [];
	// for debugging these are exposed
	enyo.pool = {};
	enyo.pool.available = pool;
	enyo.pool.claimed = claimed;
	// we start with none so it will always create the fewest possible given
	// a particular applications needs
	var scrub = function (o, c) {
		var $o = o;
		if ($o && $o._pooled && $o._released) {
			for (var k in $o) {
				if ($o.hasOwnProperty(k) && (c || !~enyo.indexOf(k, ["_claimed","_pooled","_released"]))) {
					if (c) {
						delete $o[k];
					} else {
						$o[k] = undefined;
					}
				}
			}
		}
	};

	// FOR DEBUGGING UNCOMMENT THIS
	/* var it = setInterval(function () {
		enyo.log(
			"\n----------------------------\n" +
			"POOL SIZE: " + pool.length + "\n" +
			"CLAIMED SIZE: " + claimed.length + "\n" +
			"----------------------------\n"
		);
	}, 5000); */

	// add an object to the pool if it was encountered in a reusable
	// way and return it or return an object from the pool, if none
	// are available it will create a new one and return it
	enyo.pool.claimObject = function (o) {
		var $o = o;
		if (enyo.isObject($o)) {
			claimed.push($o);
		} else if (pool.length) {
			claimed.push(($o = pool.pop()));
		} else {
			claimed.push(($o = {}));
		}
		if (true === o) {
			scrub($o, true);
		} else {
			$o._pooled = true;
			$o._claimed = enyo.bench();
			$o._released = null;
		}
		return $o;
	};
	// when an object is done being used release it back to the pool
	enyo.pool.releaseObject = function (o) {
		var $o = o, $i;
		if ($o) {
			if (!!~($i = enyo.indexOf($o, claimed))) {
				claimed.splice($i, 1);
				pool.push($o);
				$o._released = enyo.bench();
				scrub($o);
			}
		}
	};


})(enyo);