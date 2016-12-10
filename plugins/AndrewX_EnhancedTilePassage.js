//=============================================================================
// AndrewX - Enhanced Tile Passage
// AndrewX_EnhancedTilePassage.js
//=============================================================================
var AndrewX = AndrewX || {};
AndrewX.ETP = AndrewX.ETP || {};
//=============================================================================
/*:
 * @plugindesc v0.90beta Enable characters to walk behind walls. 
 * Also enable you to modify tile passage and priority.
 * @author AndrewX
 *
 * @param Wall Top Terrain Tag
 * @desc Tiles with this Terrain Tag will be calculated as wall top side. (Default: 7, Disable: a number greater than 7)
 * Use a number greater than 7 (e.g. 99) if you do not wish to make use of this property.
 * @default 7
 *
 * @param Wall Front Terrain Tag
 * @desc Tiles with this Terrain Tag will be calculated as wall front side. (Default: 6, Disable: a number greater than 7)
 * Use a number greater than 7 (e.g. 99) if you do not wish to make use of this property.
 * @default 6
 * 
 * @param Default Wall Height
 * @desc If wall front side cannot be sampled, this will be the default wall height. (Default: 2, Disable: 0)
 * Use 0 if you do not wish to make use of this property.
 * @default 2
 *
 * @param Star Terrain Tag
 * @desc Tiles with this Terrain Tag will be set to star passage (above characters). (Default: 99, Disable: greater than 7)
 * Use a number greater than 7 (e.g. 99) if you do not wish to make use of this property.
 * @default 99
 *
 * @param Star Region ID List
 * @desc Tiles with listed Region ID will be set to star passage. Separate multiple ID with commas. (Disable: 0)
 * Use 0 if you do not wish to make use of this property.
 * @default 0
 *
 * @param Higher Tile Region ID List
 * @desc Tiles with listed Region ID will be shown above characters (passage unchanged). Separate with commas. (Disable: 0)
 * Use 0 if you do not wish to make use of this property.
 * @default 0
 *
 * @param Passable Tile Region ID List
 * @desc Tiles with listed Region ID will be always passable. Separate multiple ID with commas. (Disable: 0)
 * Use 0 if you do not wish to make use of this property.
 * @default 0
 * 
 * @param Impassable Tile Region ID List
 * @desc Tiles with listed Region ID will not be passable. Separate multiple ID with commas. (Disable: 0)
 * Use 0 if you do not wish to make use of this property.
 * @default 0
 * 
 * @help
 * ============================================================================
 * Introduction and Instructions
 * ============================================================================
 *
 * It's a pity multi-layered mapping is canceled since RMVX, and characters are 
 * no longer able to walk behind walls, which makes maps a bit of weird. With 
 * this plugin, you can set two terrain tags as wall top and wall front, and 
 * passage behind walls are calculated automatically. 
 *
 * Or you can also set a terrain tag as Star Terrain Tag, which makes tiles to be
 * star passage.
 *
 * Note: above tags only works for tiles in set A.
 * 
 * You can also set lists of region IDs as following:
 * Star Region ID: Tiles with these IDs will be star passage. 
 *
 * Higher Tile Region ID: Tiles with these IDs will be shown above characters,
 * with passage unchanged. 
 *
 * Passable Tile Region ID: Tiles with these IDs will be always passable. 
 * (layer unchanged)
 * 
 * Impassable Tile Region ID: Tiles with these IDs will be not passable. 
 *
 * To disable certain function, set parameter as following:
 * Wall Top Terrain Tag: a number greater than 7 (e.g. 99)
 * Wall Front Terrain Tag: a number greater than 7 (e.g. 99)
 * Default Wall Height: set to 0
 * Star Terrain Tag: a number greater than 7 (e.g. 99)
 * Star Region ID List: set to 0
 * Higher Tile Region ID List: set to 0
 * Passable Tile Region ID List: set to 0
 * Impassable Tile Region ID List: set to 0
 *
 * Note: 
 * - 4-direction passage does not work on tiles with above tags/region id.
 * - Events in higher layer of wall need to be set to above characters priority 
 *   in order to be displayed above the wall.
 *
 *
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 0.90beta:
 * - New: Added support for MV 1.31
 * 
 * Version 0.82:
 * - Modified: Added default parameter values.
 * 
 * Version 0.81:
 * - Modified: Pulgin name changed to: Enhanced Tile Passage
 * - New: Passable Tile Region ID function (force tile to be passable)
 * - Modified: Plugin parameter description improved
 * 
 * Version 0.80:
 * - New: Higher Tile Region ID function (force tile to be higher tile)
 * - New: Impassable Tile Region ID function (force tile to be impassable)
 * - Removed: Removed Default Wall Thickness property, which is not so useful
 * - Removed: To minimize side-effects on map, terrain tags only works for 
 * 			  tiles in set A now
 * 
 * Version 0.71:
 * - Modified: Improved passage check logic
 * - Modified: Improved layer check logic
 * 
 * Version 0.70:
 * - New: Can use multiple star region IDs
 * - Modified: Minor bug fix
 * 
 * Version 0.60:
 * - Modified: Improved passage check logic
 * 
 * Version 0.51:
 * - Modified: Optimized logic for passage and higher layer check
 * - Modified: Disabled default wall thickness by default
 * 
 * Version 0.50:
 * - New: Star region ID can be used now
 * - New: Higher and lower layers of wall tile are calculated automatically now
 * - New: B~E tiles can be displayed above walls. So no need to modify 
 *   additional star passage
 * - Modified: Rearrange the order of parameters
 * 
 * Version 0.01:
 * - Finished prototype
 *
 * ============================================================================
 * Term of Use
 * ============================================================================
 *
 * Free for use in non-commercial or commercial RMMV projects
 * Please credit AndrewX
 * 
 */
//=============================================================================
(function() {
	//=============================================================================
	// Parameter Variables
	//=============================================================================

	var parameters = PluginManager.parameters('AndrewX_EnhancedTilePassage');
	var starTag = Number(parameters['Star Terrain Tag'] || 99);
	var starId = parameters['Star Region ID List'].split(",");
	for (var i = 0; i < starId.length; i++) {
		starId[i] = Number(starId[i]);
	};
	var higherId = parameters['Higher Tile Region ID List'].split(",");
	for (var i = 0; i < higherId.length; i++) {
		higherId[i] = Number(higherId[i]);
	};
	var passableId = parameters['Passable Tile Region ID List'].split(",");
	for (var i = 0; i < higherId.length; i++) {
		passableId[i] = Number(passableId[i]);
	};
	var impassableId = parameters['Impassable Tile Region ID List'].split(",");
	for (var i = 0; i < higherId.length; i++) {
		impassableId[i] = Number(impassableId[i]);
	};
	var topTag = Number(parameters['Wall Top Terrain Tag'] || 99);
	var frontTag = Number(parameters['Wall Front Terrain Tag'] || 99);
	var defWallHeight = Number(parameters['Default Wall Height'] || 0);

	//=============================================================================
	// Private tag check for game map
	//=============================================================================

	Game_Map.prototype._hasTag = function(x, y, t) {
		var flags = this.tilesetFlags();
		var tiles = this.allTiles(x, y);
		if (tiles[0] === 0 && tiles[1] === 0 && tiles[2] === 0 && tiles[3] === 0) {
			return false;
		}
		if ((flags[tiles[3]] & 0xF000) === (t << 12)) {
			return true;
		}
		return false;
	};

	//=============================================================================
	// Private passage check for upper layers
	//=============================================================================

	Game_Map.prototype._normalCheckPassage = function(x, y, bit) {
		var flags = this.tilesetFlags();
		var tiles = this.allTiles(x, y);
		for (var i = 0; i < tiles.length - 2; i++) {
			var flag = flags[tiles[i]];
			if ((flag & 0x10) !== 0) // [*] No effect on passage
				continue;
			if ((flag & bit) === 0) // [o] Passable
				return true;
			if ((flag & bit) === bit) // [x] Impassable
				return false;
		}
		return false;
	};

	//=============================================================================
	// Modified passage check
	//=============================================================================

	AndrewX.ETP.checkPassage = Game_Map.prototype.checkPassage;
	Game_Map.prototype.checkPassage = function(x, y, bit) {
		var flags = this.tilesetFlags();
		var tiles = this.allTiles(x, y);
		var mapHeight = $dataMap.height;
		var upperTop = 0;
		var upperFront = 0;
		var lowerTop = 0;
		var lowerFront = 0;
		if ($gameMap.regionId(x, y) && starId.contains($gameMap.regionId(x, y))) {
			return true;
		}
		if ($gameMap.regionId(x, y) && passableId.contains($gameMap.regionId(x, y))) {
			return true;
		}
		if ($gameMap.regionId(x, y) && impassableId.contains($gameMap.regionId(x, y))) {
			return false;
		}
		if (!(this._hasTag(x, y, topTag) || this._hasTag(x, y, frontTag) ||
				this._hasTag(x, y, starTag))) {
			return AndrewX.ETP.checkPassage.call(this, x, y, bit);
		}
		if (this._hasTag(x, y, starTag)) {
			return true;
		} else if (this._hasTag(x, y, frontTag)) {
			var j = 1;
			while (y + j < mapHeight && this._hasTag(x, y + j, frontTag)) {
				lowerFront++;
				j++;
			}
			j = 1;
			while (y - j >= 0 && this._hasTag(x, y - j, frontTag)) {
				upperFront++;
				j++;
			}
			while (y - j >= 0 && this._hasTag(x, y - j, topTag)) {
				upperTop++;
				j++;
			}
			if (upperTop === 0) {
				return this._normalCheckPassage(x, y, bit);
			} else if (lowerFront + 1 <= upperTop) {
				return this._normalCheckPassage(x, y, bit);
			} else {
				return true;
			}
		} else if (this._hasTag(x, y, topTag)) {
			var j = 1;
			while (y - j >= 0 && this._hasTag(x, y - j, topTag)) {
				upperTop++;
				j++;
			}
			j = 1;
			while (y + j < mapHeight && this._hasTag(x, y + j, topTag)) {
				lowerTop++;
				j++;
			}
			while (y + j < mapHeight && this._hasTag(x, y + j, frontTag)) {
				lowerFront++;
				j++;
			}
			if (lowerFront === 0) {
				if (upperTop + 1 <= defWallHeight) {
					return true;
				} else {
					return this._normalCheckPassage(x, y, bit);
				}
			} else if (upperTop + 1 <= lowerFront) {
				return true;
			} else {
				return this._normalCheckPassage(x, y, bit);
			}
		}
	};

	//=============================================================================
	// Private tag check for tilemap
	//=============================================================================

	Tilemap.prototype._tileHasTag = function(x, y, t) {
		var tileId = this._readMapData(x, y, 0);
		if ((this.flags[tileId] & 0xF000) === (t << 12)) {
			return true;
		}
		return false;
	};

	//=============================================================================
	// Private new higher tile check
	//=============================================================================

	Tilemap.prototype._isHigherTileNew = function(x, y) {
		var mapHeight = this._mapHeight;
		var upperTop = 0;
		var upperFront = 0;
		var lowerTop = 0;
		var lowerFront = 0;
		if ($gameMap.regionId(x, y + 1) && starId.contains($gameMap.regionId(x, y + 1))) {
			return true;
		} //if lower tile is star passage
		if ($gameMap.regionId(x, y) && starId.contains($gameMap.regionId(x, y))) {
			return true;
		} else if ($gameMap.regionId(x, y) && higherId.contains($gameMap.regionId(x, y))) {
			return true;
		} else if (this._tileHasTag(x, y, starTag)) {
			return true;
		} else if (this._tileHasTag(x, y, frontTag)) {
			var i = 1;
			while (y + i < mapHeight && this._tileHasTag(x, y + i, frontTag)) {
				lowerFront++;
				i++;
			}
			i = 1;
			while (y - i >= 0 && this._tileHasTag(x, y - i, frontTag)) {
				upperFront++;
				i++;
			}
			while (y - i >= 0 && this._tileHasTag(x, y - i, topTag)) {
				upperTop++;
				i++;
			}
			if (upperTop === 0) {
				return false;
			} else if (lowerFront + 1 <= upperTop) {
				return false;
			} else {
				return true;
			}
		} else if (this._tileHasTag(x, y, topTag)) {
			var i = 1;
			while (y - i >= 0 && this._tileHasTag(x, y - i, topTag)) {
				upperTop++;
				i++;
			}
			i = 1;
			while (y + i < mapHeight && this._tileHasTag(x, y + i, topTag)) {
				lowerTop++;
				i++;
			}
			while (y + i < mapHeight && this._tileHasTag(x, y + i, frontTag)) {
				lowerFront++;
				i++;
			}
			if (lowerFront === 0) {
				if (upperTop + 1 <= defWallHeight) {
					return true;
				} else {
					return false;
				}
			} else if (upperTop + 1 <= lowerFront) {
				return true;
			} else {
				return false;
			}
		} else {
			return false;
		}
	};

	//=============================================================================
	// Modified _paintTiles
	//=============================================================================

	AndrewX.ETP._paintTiles_Tilemap = Tilemap.prototype._paintTiles;
	Tilemap.prototype._paintTiles = function(startX, startY, x, y) {
		if (($gameMap.regionId(startX + x, startY + y) &&
				starId.contains($gameMap.regionId(startX + x, startY + y))) ||
			($gameMap.regionId(startX + x, startY + y) &&
				higherId.contains($gameMap.regionId(startX + x, startY + y))) ||
			this._tileHasTag(startX + x, startY + y, starTag) ||
			this._tileHasTag(startX + x, startY + y, topTag) ||
			this._tileHasTag(startX + x, startY + y, frontTag)) {
			var tableEdgeVirtualId = 10000;
			var mx = startX + x;
			var my = startY + y;
			var dx = (mx * this._tileWidth).mod(this._layerWidth);
			var dy = (my * this._tileHeight).mod(this._layerHeight);
			var lx = dx / this._tileWidth;
			var ly = dy / this._tileHeight;
			var tileId0 = this._readMapData(mx, my, 0);
			var tileId1 = this._readMapData(mx, my, 1);
			var tileId2 = this._readMapData(mx, my, 2);
			var tileId3 = this._readMapData(mx, my, 3);
			var shadowBits = this._readMapData(mx, my, 4);
			var upperTileId1 = this._readMapData(mx, my - 1, 1);
			var lowerTiles = [];
			var upperTiles = [];

			var isHigher = this._isHigherTileNew(mx, my);

			if (isHigher) {
				upperTiles.push(tileId0);
			} else {
				lowerTiles.push(tileId0);
			}
			if (isHigher) {
				upperTiles.push(tileId1);
			} else {
				lowerTiles.push(tileId1);
			}

			lowerTiles.push(-shadowBits);

			if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
				if (!Tilemap.isShadowingTile(tileId0)) {
					lowerTiles.push(tableEdgeVirtualId + upperTileId1);
				}
			}

			if (this._isOverpassPosition(mx, my)) {
				upperTiles.push(tileId2);
				upperTiles.push(tileId3);
			} else {
				if (isHigher) {
					upperTiles.push(tileId2);
				} else {
					lowerTiles.push(tileId2);
				}
				if (isHigher) {
					upperTiles.push(tileId3);
				} else {
					lowerTiles.push(tileId3);
				}
			}

			var lastLowerTiles = this._readLastTiles(0, lx, ly);
			if (!lowerTiles.equals(lastLowerTiles) ||
				(Tilemap.isTileA1(tileId0) && this._frameUpdated)) {
				this._lowerBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
				for (var i = 0; i < lowerTiles.length; i++) {
					var lowerTileId = lowerTiles[i];
					if (lowerTileId < 0) {
						this._drawShadow(this._lowerBitmap, shadowBits, dx, dy);
					} else if (lowerTileId >= tableEdgeVirtualId) {
						this._drawTableEdge(this._lowerBitmap, upperTileId1, dx, dy);
					} else {
						this._drawTile(this._lowerBitmap, lowerTileId, dx, dy);
					}
				}
				this._writeLastTiles(0, lx, ly, lowerTiles);
			}

			var lastUpperTiles = this._readLastTiles(1, lx, ly);
			if (!upperTiles.equals(lastUpperTiles)) {
				this._upperBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
				for (var j = 0; j < upperTiles.length; j++) {
					this._drawTile(this._upperBitmap, upperTiles[j], dx, dy);
				}
				this._writeLastTiles(1, lx, ly, upperTiles);
			}
		} else {
			AndrewX.ETP._paintTiles_Tilemap.call(this, startX, startY, x, y);
		}
	};

	AndrewX.ETP._paintTiles_ShaderTilemap = ShaderTilemap.prototype._paintTiles;
	ShaderTilemap.prototype._paintTiles = function(startX, startY, x, y) {
		if (($gameMap.regionId(startX + x, startY + y) &&
				starId.contains($gameMap.regionId(startX + x, startY + y))) ||
			($gameMap.regionId(startX + x, startY + y) &&
				higherId.contains($gameMap.regionId(startX + x, startY + y))) ||
			this._tileHasTag(startX + x, startY + y, starTag) ||
			this._tileHasTag(startX + x, startY + y, topTag) ||
			this._tileHasTag(startX + x, startY + y, frontTag)) {
			var mx = startX + x;
			var my = startY + y;
			var dx = x * this._tileWidth,
				dy = y * this._tileHeight;
			var tileId0 = this._readMapData(mx, my, 0);
			var tileId1 = this._readMapData(mx, my, 1);
			var tileId2 = this._readMapData(mx, my, 2);
			var tileId3 = this._readMapData(mx, my, 3);
			var shadowBits = this._readMapData(mx, my, 4);
			var upperTileId1 = this._readMapData(mx, my - 1, 1);
			var lowerLayer = this.lowerLayer.children[0];
			var upperLayer = this.upperLayer.children[0];

			var isHigher = this._isHigherTileNew(mx, my);

			if (isHigher) {
				this._drawTile(upperLayer, tileId0, dx, dy);
			} else {
				this._drawTile(lowerLayer, tileId0, dx, dy);
			}
			if (isHigher) {
				this._drawTile(upperLayer, tileId1, dx, dy);
			} else {
				this._drawTile(lowerLayer, tileId1, dx, dy);
			}

			this._drawShadow(lowerLayer, shadowBits, dx, dy);
			if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
				if (!Tilemap.isShadowingTile(tileId0)) {
					this._drawTableEdge(lowerLayer, upperTileId1, dx, dy);
				}
			}

			if (this._isOverpassPosition(mx, my)) {
				this._drawTile(upperLayer, tileId2, dx, dy);
				this._drawTile(upperLayer, tileId3, dx, dy);
			} else {
				if (isHigher) {
					this._drawTile(upperLayer, tileId2, dx, dy);
				} else {
					this._drawTile(lowerLayer, tileId2, dx, dy);
				}
				if (isHigher) {
					this._drawTile(upperLayer, tileId3, dx, dy);
				} else {
					this._drawTile(lowerLayer, tileId3, dx, dy);
				}
			}
		} else {
			AndrewX.ETP._paintTiles_ShaderTilemap.call(this, startX, startY, x, y);
		}
	};

})();