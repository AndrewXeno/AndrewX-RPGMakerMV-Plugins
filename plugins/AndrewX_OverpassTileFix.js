//=============================================================================
// AndrewX - OverpassTileFix
// AndrewX_OverpassTileFix.js
//=============================================================================
var AndrewX = AndrewX || {};
AndrewX.OTF = AndrewX.OTF || {};
//=============================================================================
/*:
 * @plugindesc v0.10 Add collision & trigger check and initial layers for events when using OverpassTile.js and more.
 * @author AndrewX
 *
 * @param Disable Damage Floor
 * @desc While ON, character will not get damaged if they are on higher level of damage floor. (Default: OFF)
 * @default OFF
 *
 * @param Disable Bush Effect
 * @desc While ON, bush tile will not affect character on higher level. (Default: OFF)
 * @default OFF
 * 
 * @help
 * ============================================================================
 * Introduction and Instructions
 * ============================================================================
 * The Kadokawa OverpassTile plugin does not support the collision judgment 
 * modification between characters who are in different floors. This plugin 
 * provides:
 *
 * If a character or event is initially placed on a overpass tile, it will
 * automatically be put on the top of the tile.
 * 
 * Characters and events on different levels does not collide with each other.
 *
 * Character cannot trigger events in a different level.
 *
 * (Optional) Bush tile and damage floor will not affect character that on 
 * higher level.
 *
 * 
 * Note:
 * Make sure this plugin is used together with OverpassTile.js by Kadokawa.
 *
 * As defined in OverpassTile.js, if a character or event is in gateway 
 * region, it is set on higher level. Once it enters a non-overpass region,
 * it is set to be on lower level.
 * 
 * Event trigger level check fix will not work if the event and character are
 * on the same level.
 *
 * If an event is placed between edge of higher and lower level (i.e. around 
 * the gateway tile), level collision check might go wrong. Please be careful 
 * with this situation.
 *
 * If Disable Damage Floor and Disable Bush Effect functions are ON, for 
 * overpass and gateway regions, damage floor and bush effort will ALWAYS be 
 * ignored if the character is on higher level, and will still be valid if 
 * character is on lower level. So you cannot make them affect character that
 * on higher level. 
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
 * Please credit AndrewX
 * 
 */
//=============================================================================

(function() {

	var parameters = PluginManager.parameters('AndrewX_OverpassTileFix');
	var disableDamage = parameters['Disable Damage Floor'];
	var disableBush = parameters['Disable Bush Effect'];
	
	AndrewX.OTF.isCollidedWithEvents = Game_CharacterBase.prototype.isCollidedWithEvents;
	Game_CharacterBase.prototype.isCollidedWithEvents = function(x, y) {
		var events = $gameMap.eventsXyNt(x, y);
		var higher = this._higherLevel;
		return events.some(function(event) {
			if (!event.isNormalPriority()) {
				return false
			}
			if (event._higherLevel != higher) {
				return false;
			}
			return true;
		});
	};

	AndrewX.OTF.refreshBushDepth = Game_CharacterBase.prototype.refreshBushDepth;
	Game_CharacterBase.prototype.refreshBushDepth = function() {
		AndrewX.OTF.refreshBushDepth.call(this);
		if (this._higherLevel === undefined) {
			this._higherLevel = true;
		}
		if (disableBush.toUpperCase() === "ON" && this._higherLevel === true) {
			this._bushDepth = 0;
		}
	};

	AndrewX.OTF.isCollidedWithPlayerCharacters = Game_Event.prototype.isCollidedWithPlayerCharacters;
	Game_Event.prototype.isCollidedWithPlayerCharacters = function(x, y) {
		if (this._higherLevel != $gamePlayer._higherLevel) {
			return false;
		}
		return AndrewX.OTF.isCollidedWithPlayerCharacters.call(this, x, y);
	};

	AndrewX.OTF.startMapEvent = Game_Player.prototype.startMapEvent;
	Game_Player.prototype.startMapEvent = function(x, y, triggers, normal) {
		if (!$gameMap.isEventRunning()) {
			$gameMap.eventsXy(x, y).forEach(function(event) {
				if (event.isTriggerIn(triggers) && event.isNormalPriority() === normal) {
					if (event._higherLevel === $gamePlayer._higherLevel) {
						event.start();
					}
				}
			});
		}
	};

	AndrewX.OTF.isOnDamageFloor = Game_Player.prototype.isOnDamageFloor;
	Game_Player.prototype.isOnDamageFloor = function() {
		if (disableDamage.toUpperCase() === "ON" && this._higherLevel === true) {
			return false;
		}
		return $gameMap.isDamageFloor(this.x, this.y) && !this.isInAirship();
	};

})();