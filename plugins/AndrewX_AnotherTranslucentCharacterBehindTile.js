//=============================================================================
// AndrewX - Another Translucent Character Behind Tile
// AndrewX_AnotherTranslucentCharacterBehindTile.js
//=============================================================================
var AndrewX = AndrewX || {};
AndrewX.ATCBT = AndrewX.ATCBT || {};
//=============================================================================
/*:
 * @plugindesc v0.10 Enable characters behind higher tiles become translucent.
 * @author AndrewX
 *
 * @param Default Behind Tile Opacity
 * @desc The default opacity for character behind tile. (Range: [0, 255], Default: 50)
 * @default 50
 *
 * @param Behind Tile Opacity Variable ID
 * @desc Set a variable ID to use that variable's value to modify Behind Tile Opacity. Use 0 if you do not need this feature. (Default: 0)
 * @default 0
 * 
 * @help
 * ============================================================================
 * Introduction and Instructions
 * ============================================================================
 *
 * This is another plugin to display a translucent character when he is covered
 * by a higher tile. This plugin is greatly inspired by wangwang and thanks to
 * his smart idea, this plugin modifies higher tile layer instead of character
 * sprites, thus this one will not suffer overlapping character sprite issue
 * as the previous plugin does. The drawback for this one is you cannot modify
 * behind tile visibility for individual character.
 *
 * Usage:
 * 1. Installation: Just enable the plugin in the Plugin Manager.
 *
 * 2. Setup parameters.
 *  a. Default Behind Tile Opacity:
 *      The default opacity for character behind tile. This is actually the
 *      opacity for higher tile layer, so that the real behind tile character's
 *      opacity will be determined by this value together with character's own
 *      opacity.
 *      Valid value will be a number in range [0, 255]. 0 means this plugin
 *      will not take effect.
 *      The default value for this parameter is 50.
 *  b. Behind Tile Opacity Variable ID
 *      You can also use a variable to get dynamic control of the behind tile
 *      opacity. This parameter takes in a variable ID in your game, and the
 *      behind tile opacity will be determined by the value of that variable.
 *      If you use the variable to control opacity, the Default Behind Tile
 *      Opacity will be ignored. Remember to adjust the variable you assigned
 *      to make the plugin to work.
 *      Use 0 if you do not need this feature.
 *      The default value for this parameter is 0.
 *
 * This plugin does not provide plugin command.
 * 
 * ============================================================================
 * Changelog
 * ============================================================================
 * 
 * Version 0.10:
 * - Finished prototype
 *
 * ============================================================================
 * Term of Use
 * ============================================================================
 *
 * Free for use in non-commercial or commercial RMMV projects
 * Please credit AndrewX, wangwang
 * 
 */
//=============================================================================


(function() {

	var parameters = PluginManager.parameters('AndrewX_AnotherTranslucentCharacterBehindTile');
	var defaultOpacity = Number(parameters['Default Behind Tile Opacity'] || 0);
	var opacityVariableId = Number(parameters['Behind Tile Opacity Variable ID'] || 0);

	AndrewX.ATCBT._createLayers = Tilemap.prototype._createLayers;
	Tilemap.prototype._createLayers = function() {
		var width = this._width;
		var height = this._height;
		var margin = this._margin;
		var tileCols = Math.ceil(width / this._tileWidth) + 1;
		var tileRows = Math.ceil(height / this._tileHeight) + 1;
		var layerWidth = tileCols * this._tileWidth;
		var layerHeight = tileRows * this._tileHeight;
		this._lowerBitmap = new Bitmap(layerWidth, layerHeight);
		this._upperBitmap = new Bitmap(layerWidth, layerHeight);
		this._layerWidth = layerWidth;
		this._layerHeight = layerHeight;

		this._lowerLayer = new Sprite();
		this._lowerLayer.move(-margin, -margin, width, height);
		this._lowerLayer.z = 0;

		this._upperLayer = new Sprite();
		this._upperLayer.move(-margin, -margin, width, height);
		this._upperLayer.z = 4;

		for (var i = 0; i < 4; i++) {
			this._lowerLayer.addChild(new Sprite(this._lowerBitmap));
			this._upperLayer.addChild(new Sprite(this._upperBitmap));
		}

		this.addChild(this._lowerLayer);
		this.addChild(this._upperLayer);

		// add a new upperLayer0 at layer z = 0
		this._upperLayer0 = new Sprite();
		this._upperLayer0.move(-margin, -margin, width, height);
		this._upperLayer0.z = 0;

		for (var i = 0; i < 4; i++) {
			this._upperLayer0.addChild(new Sprite(this._upperBitmap));
		}
		this.addChild(this._upperLayer0);
	};

	AndrewX.ATCBT._updateLayerPositions = Tilemap.prototype._updateLayerPositions;
	Tilemap.prototype._updateLayerPositions = function(startX, startY) {
		var m = this._margin;
		var ox = Math.floor(this.origin.x);
		var oy = Math.floor(this.origin.y);
		var x2 = (ox - m).mod(this._layerWidth);
		var y2 = (oy - m).mod(this._layerHeight);
		var w1 = this._layerWidth - x2;
		var h1 = this._layerHeight - y2;
		var w2 = this._width - w1;
		var h2 = this._height - h1;

		for (var i = 0; i < 2; i++) {
			var children;
			if (i === 0) {
				children = this._lowerLayer.children;
			} else {
				children = this._upperLayer.children;
			}
			children[0].move(0, 0, w1, h1);
			children[0].setFrame(x2, y2, w1, h1);
			children[1].move(w1, 0, w2, h1);
			children[1].setFrame(0, y2, w2, h1);
			children[2].move(0, h1, w1, h2);
			children[2].setFrame(x2, 0, w1, h2);
			children[3].move(w1, h1, w2, h2);
			children[3].setFrame(0, 0, w2, h2);
		}

		// add update for the new upperLayer0
		var children = this._upperLayer0.children;
		children[0].move(0, 0, w1, h1);
		children[0].setFrame(x2, y2, w1, h1);
		children[1].move(w1, 0, w2, h1);
		children[1].setFrame(0, y2, w2, h1);
		children[2].move(0, h1, w1, h2);
		children[2].setFrame(x2, 0, w1, h2);
		children[3].move(w1, h1, w2, h2);
		children[3].setFrame(0, 0, w2, h2);

		// update the original upperLayer's opacity
		var opacityValue;
		if (opacityVariableId >= 1) {
			opacityValue = 255 - $gameVariables.value(opacityVariableId);
		} else {
			opacityValue = 255 - defaultOpacity;
		}
		this._upperLayer.opacity = opacityValue;
	};
})();