require('enyo');

/**
* Shared values for various [kinds]{@glossary kind} used to indicate a state or
* (multiple, simultaneous) states. These flags are binary values represented by
* hexadecimal numerals. They may be modified and compared (or even extended) using
* [bitwise operations]{@glossary bitwise} or various
* [API methods]{@link module:enyo/StateSupport~StateSupport} available to the kinds that support them.
* Make sure to explore the documentation for individual kinds, as they may have
* specific uses for a given flag.
* 
* As a cursory overview, here is a table of the values already declared by built-in flags.
* Each hexadecimal numeral represents a unique power of 2 in binary, from which we can use
* [bitwise masks]{@glossary bitwise} to determine if a particular value is present.
* 
* ```javascript
* HEX             DEC             BIN
* 0x0001             1            0000 0000 0000 0001
* 0x0002             2            0000 0000 0000 0010
* 0x0004             4            0000 0000 0000 0100
* 0x0008             8            0000 0000 0000 1000
* 0x0010            16            0000 0000 0001 0000
* 0x0020            32            0000 0000 0010 0000
* 0x0040            64            0000 0000 0100 0000
* 0x0080           128            0000 0000 1000 0000
* 0x0100           256            0000 0001 0000 0000
* 0x0200           512            0000 0010 0000 0000
* 0x0400          1024            0000 0100 0000 0000
* 0x0800          2048            0000 1000 0000 0000
* 
* ...
* 
* 0x1000          4096            0001 0000 0000 0000
* ```
*
* As a hint, converting (HEX) 0x0800 to DEC do:
*
* ```javascript
* (0*16^3) + (8*16^2) + (0*16^1) + (0*16^0) = 2048
* ```
*
* As a hint, converting (HEX) 0x0800 to BIN do:
*
* ```javascript
* 0    8    0    0    (HEX)
* ---- ---- ---- ----
* 0000 1000 0000 0000 (BIN)
* ```
*
* @module enyo/States
* @public
* @see module:enyo/StateSupport~StateSupport
*/
module.exports = {
	
	/**
	* Only exists in the client and was created during the runtime of the
	* [application]{@glossary application}.
	*
	* @type {Number}
	* @default 1
	*/
	NEW: 0x0001,
	
	/**
	* Has been modified locally only.
	*
	* @type {Number}
	* @default 2
	*/
	DIRTY: 0x0002,
	
	/**
	* Has not been modified locally.
	*
	* @type {Number}
	* @default 4
	*/
	CLEAN: 0x0004,
	
	/**
	* Can no longer be modified.
	* @type {Number}
	* @default 8
	*/
	DESTROYED: 0x0008,
	
	/**
	* Currently attempting to fetch.
	* 
	* @see module:enyo/Model~Model.fetch
	* @see module:enyo/RelationalModel~RelationalModel.fetch
	* @see module:enyo/Collection~Collection.fetch
	*
	* @type {Number}
	* @default 16
	*/
	FETCHING: 0x0010,
	
	/**
	* Currently attempting to commit.
	* 
	* @see module:enyo/Model~Model.commit
	* @see module:enyo/RelationalModel~RelationalModel.commit
	* @see module:enyo/Collection~Collection.commit
	*
	* @type {Number}
	* @default 32
	*/
	COMMITTING: 0x0020,
	
	/**
	* Currently attempting to destroy.
	* 
	* @see module:enyo/Model~Model.destroy
	* @see module:enyo/RelationalModel~RelationalModel.destroy
	* @see module:enyo/Collection~Collection.destroy
	*
	* @type {Number}
	* @default 64
	*/
	DESTROYING: 0x0040,
	
	/**
	* There was an error during commit.
	* 
	* @see module:enyo/Model~Model.commit
	* @see module:enyo/RelationalModel~RelationalModel.commit
	* @see module:enyo/Collection~Collection.commit
	*
	* @type {Number}
	* @default 128
	*/
	ERROR_COMMITTING: 0x0080,
	
	/**
	* There was an error during fetch.
	* 
	* @see module:enyo/Model~Model.fetch
	* @see module:enyo/RelationalModel~RelationalModel.fetch
	* @see module:enyo/Collection~Collection.fetch
	*
	* @type {Number}
	* @default 256
	*/
	ERROR_FETCHING: 0x0100,
	
	/**
	* There was an error during destroy.
	* 
	* @see module:enyo/Model~Model.destroy
	* @see module:enyo/RelationalModel~RelationalModel.destroy
	* @see module:enyo/Collection~Collection.destroy
	*
	* @type {Number}
	* @default 512
	*/
	ERROR_DESTROYING: 0x0200,
	
	/**
	* An error was encountered for which there was no exact flag, or an invalid error was
	* specified.
	*
	* @type {Number}
	* @default 1024
	*/
	ERROR_UNKNOWN: 0x0400,
	
	/**
	* A multi-state [bitmask]{@glossary bitwise}. Compares a given flag to the states
	* included in the definition of `BUSY`. By default, this is one of
	* [FETCHING]{@link module:enyo/States.FETCHING}, [COMMITTING]{@link module:enyo/States.COMMITTING}, or
	* [DESTROYING]{@link module:enyo/States.DESTROYING}. It may be extended to include additional
	* values using the [bitwise]{@glossary bitwise} `OR` operator (`|`).
	*
	* @type {Number}
	* @default 112
	*/
	BUSY: 0x0010 | 0x0020 | 0x0040,
	
	/**
	* A multi-state [bitmask]{@glossary bitwise}. Compares a given flag to the states
	* included in the definition of `ERROR`. By default, this is one of
	* [ERROR_FETCHING]{@link module:enyo/States.ERROR_FETCHING},
	* [ERROR_COMMITTING]{@link module:enyo/States.ERROR_COMMITTING},
	* [ERROR_DESTROYING]{@link module:enyo/States.ERROR_DESTROYING}, or
	* [ERROR_UNKNOWN]{@link module:enyo/States.ERROR_UNKNOWN}. It may be extended to include
	* additional values using the [bitwise]{@glossary bitwise} `OR` operator (`|`).
	*
	* @type {Number}
	* @default 1920
	*/
	ERROR: 0x0080 | 0x0100 | 0x0200 | 0x0400,
	
	/**
	* A multi-state [bitmask]{@glossary bitwise}. Compares a given flag to the states
	* included in the definition of `READY`. By default, this is the inverse of any
	* values included in [BUSY]{@link module:enyo/States.BUSY} or [ERROR]{@link module:enyo/States.ERROR}.
	*
	* @type {Number}
	* @default -2041
	*/
	READY: ~(0x0008 | 0x0010 | 0x0020 | 0x0040 | 0x0080 | 0x0100 | 0x0200 | 0x0400)
};
