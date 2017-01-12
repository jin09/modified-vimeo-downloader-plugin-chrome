
    Polymer({

      publish: {

        label: '',

        /**
         * If true, the button will be styled with a shadow.
         *
         * @attribute raised
         * @type boolean
         * @default false
         */
        raised: false,
        raisedButton: false,

        /**
         * By default the ripple emanates from where the user touched the button.
         * Set this to true to always center the ripple.
         *
         * @attribute recenteringTouch
         * @type boolean
         * @default false
         */
        recenteringTouch: false,

        /**
         * By default the ripple expands to fill the button. Set this to true to
         * constrain the ripple to a circle within the button.
         *
         * @attribute fill
         * @type boolean
         * @default true
         */
        fill: true

      },

      labelChanged: function() {
        if (this.label) {
          console.warn('The "label" property is deprecated.');
        }
      },

      raisedButtonChanged: function() {
        if (this.raisedButton) {
          console.warn('The "raisedButton" property is deprecated.');
        }
      }

    });
  