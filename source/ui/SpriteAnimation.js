(function (enyo, scope) {
	/**
	* _enyo.Sprite_ is a basic animation [component]{@link enyo.Component}. Call _play()_ to start
	* the animation. The animation will run for the period of time (in milliseconds) specified by 
	* its [duration]{@link enyo.SpriteAnimation#duration}.
	*
	* @class enyo.SpriteAnimation
	* @public
	*/
	enyo.kind(
		/** @lends enyo.SpriteAnimation.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.SpriteAnimation',
		
		/**
		* @private
		*/
		published: 
			/** @lends enyo.SpriteAnimation.prototype */ {

			/**
			* Default value used if the animation has no 
			* [duration]{@link enyo.SpriteAnimation#duration} specified.
			* 
			* @type {String}
			* @default ''false''
			* @public
			*/
			src: '',

			/**
			* The amount of milliseconds your animation will run.
			* 
			* @type {Number}
			* @default 5000
			* @public
			*/
			duration: 5000,

			/**
			* The width of a single sprite-cell image.
			* 
			* @type {Number}
			* @default 100
			* @public
			*/
			width: 100,

			/**
			* The height of a single sprite-cell image.
			* 
			* @type {Number}
			* @default 100
			* @public
			*/
			height: 100,

			/**
			* The number of rows of sprites-cells.
			* 
			* @type {Number}
			* @default 1
			* @public
			*/
			rows: 1,

			/**
			* The number of columns of sprites-cells.
			* 
			* @type {Number}
			* @default 2
			* @public
			*/
			columns: 2,

			/**
			* Accepts any valid CSS animation-iteration-count value.
			* 
			* @type {String}
			* @default 'infinite'
			* @public
			*/
			iterationCount: 'infinite',

			/**
			* Indicates whether the cells are horizontally laid-out or vertically laid-out. Example:
			* ```
			* Horizontal:
			*	[1][2]
			*	[3][4]
			* Vertical:
			*	[1][3]
			*	[2][4]
			* ```
			* 
			* @type {String}
			* @default 'horizontal'
			* @public
			*/
			cellOrientation: 'horizontal',

			/**
			* Apply an offset to the coordinates of the first sprite. Normally this can be left at 
			* 0x0, but if you have multiple sprites in a single image file, or there's a padding 
			* around your image, specify the amount of pixels.
			* 
			* @type {Number}
			* @default 0
			* @public
			*/
			offsetTop: 0,
			/**
			* Apply an offset to the coordinates of the first sprite. Normally this can be left at 
			* 0x0, but if you have multiple sprites in a single image file, or there's a padding 
			* around your image, specify the amount of pixels.
			* 
			* @type {Number}
			* @default 0
			* @public
			*/
			offsetLeft: 0
		},

		/**
		* @private
		*/
		components: [
			{kind: 'enyo.Image', name: 'spriteImage', mixins: ['enyo.StylesheetSupport'], sizing: 'cover', styles: 'background-size: initial;'}
		],

		/**
		* @private
		*/
		bindings: [
			{from: '.src', to: '.$.spriteImage.src'}
		],

		/**
		* @private
		*/
		computed: {
			'animationName': ['id'],
			'totalWidth': ['offsetLeft', 'width', 'columns'],
			'totalHeight': ['offsetTop', 'height', 'rows'],
			'steps': ['cellOrientation', 'columns', 'rows']
		},

		/**
		* @private
		*/
		observers: {
			setSize: ['width', 'height', 'totalWidth', 'totalHeight'],
			setOffset: ['offsetTop', 'offsetLeft'],
			_applyAnimation: ['iterationCount', 'cellOrientation', 'columns', 'rows', 'id'],
			updateKeyframes: ['cellOrientation', 'width', 'height', 'totalWidth', 'totalHeight', 'columns', 'rows', 'offsetTop', 'offsetLeft']
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
			
				this.setSize();
				this.updateKeyframes();
				this._applyAnimation();
			};
		}),

		/**
		* @private
		*/
		durationChanged: function() {
			this.$.spriteImage.applyStyle('-webkit-animation-duration', (this.get('duration') / 1000) + 's');
			this._forceAnimationReset();
		},

		/**
		* @private
		*/
		setSize: function() {
			this.applyStyle('width', this.get('width') + 'px');
			this.applyStyle('height', this.get('height') + 'px');
			this.applyStyle('overflow', 'hidden');

			this.$.spriteImage.applyStyle('width', this.get('totalWidth') + 'px');
			this.$.spriteImage.applyStyle('height', this.get('totalHeight') + 'px');
		},

		/**
		* @private
		*/
		setOffset: function() {
			this.$.spriteImage.applyStyle('background-position', this.get('offsetTop') + 'px ' + this.get('offsetLeft') + 'px');
		},

		/**
		* @private
		*/
		updateKeyframes: function() {
			this.$.spriteImage.set('stylesheetContent', this._generateKeyframes());
			this._forceAnimationReset();
		},

		/**
		* @private
		*/
		animationName: function() {
			return this.get('id') + '_keyframes';
		},

		/**
		* @private
		*/
		totalWidth: function() {
			return this.get('offsetLeft') + this.get('width') * this.get('columns');
		},

		/**
		* @private
		*/
		totalHeight: function() {
			return this.get('offsetTop') + this.get('height') * this.get('rows');
		},

		/**
		* @private
		*/
		steps: function() {
			return (this.get('cellOrientation') == 'horizontal') ? this.get('columns') : this.get('rows');
		},

		/**
		* @private
		*/
		_forceAnimationReset: function() {
			this.$.spriteImage.applyStyle('-webkit-animation-name', null);
			this.startJob('forceAnimationReset', function() {
				this.$.spriteImage.applyStyle('-webkit-animation-name', this.get('animationName'));
			}, 100);	// This long delay is needed to force webkit to un-set and re-set the animation.
		},

		/**
		* @private
		*/
		_applyAnimation: function() {
			this.$.spriteImage.applyStyle('-webkit-animation-timing-function', 'steps(' + this.get('steps') + ', start)');
			this.$.spriteImage.applyStyle('-webkit-animation-iteration-count', this.get('iterationCount'));
			this.durationChanged();
		},

		/**
		* @private
		*/
		_generateKeyframes: function() {
			var o,
				width = this.get('width'),
				height = this.get('height'),
				rows = this.get('rows'),
				cols = this.get('columns'),
				horiz = this.get('cellOrientation') == 'horizontal' ? true : false,
				kfStr = '',
				outer = (horiz ? rows : cols);

			kfStr += '@-webkit-keyframes '+ this.get('animationName') +' {\n';
			for (o = 0; o < outer; o++) {
				kfStr += this._generateKeyframe(
					// percent
					((o / outer) ? ((o / outer) + 0.0001) : 0),
					// startX
					horiz ? width : (-width * o),
					// startY
					horiz ? (-height * o) : height
				);
				kfStr += this._generateKeyframe(
					// percent
					((o+1) / outer),
					// endX
					horiz ? ((-width * cols) + width) : (-width * o),
					// endY
					horiz ? (-height * o) : ((-height * rows) + height)
				);
			}
			kfStr += '}\n';
			return kfStr;
		},

		/**
		* @private
		*/
		_generateKeyframe: function(inPercent, inX, inY) {
			return (inPercent * 100) +'%	{ -webkit-transform: translateZ(0) translateX('+ inX +'px)   translateY('+ inY +'px); }\n';
		}
	});

})(enyo, this);
