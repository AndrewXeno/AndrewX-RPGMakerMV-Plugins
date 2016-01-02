//=============================================================================
// AndrewX - Smart Event Chase Player
// AndrewX_SmartEventChasePlayer.js
//=============================================================================
var AndrewX = AndrewX || {};
AndrewX.SECP = AndrewX.SECP || {};
//=============================================================================
/*:
 * @plugindesc v0.10 Add Shaz's Smart Path finding into Yanfly's Event Chase Player plugin.
 * @author AndrewX
 * 
 * @help
 * ============================================================================
 * Introduction and Instructions
 * ============================================================================
 *
 * This plugin simply adds Shaz's Smart Path finding into Yanfly's Event Chase 
 * Player plugin. When (and only when) an event is set "this._smartPath = true"
 * in its script call window within the Movement Route event, and it starts to 
 * chase player by Yanfly's Event Chase Player plugin, it will be smarter in 
 * finding its way. (e.g. a single wall will not stop it).
 *
 * In order to use this plugin, you have to enable BOTH Shaz's SmartPath.js AND
 * Yanfly's YEP_EventChasePlayer.js!
 * 
 * Enable this plugin UNDER SmartPath.js and YEP_EventChasePlayer.js. Then add 
 * 		this._smartPath = true
 * in event's script call window within the Movement Route event. In some
 * situations, if you want, you can use 
 * 		this._smartPath = false
 * to disable certain event's smart path finding.
 *
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
 * Free for use in non-commercial or commercial RMMV projects.
 * You may credit AndrewX, but you don't have to. But PLEASE credit Shaz and 
 * Yanfly for their wonderful plugins.
 * 
 */
//=============================================================================
AndrewX.SECP.clearChaseSettings = Game_Event.prototype.clearChaseSettings;
Game_Event.prototype.clearChaseSettings = function() {
	AndrewX.SECP.clearChaseSettings.call(this);
	this._smartPath = false;
};

AndrewX.SECP.updateChaseMovement = Game_Event.prototype.updateChaseMovement;
Game_Event.prototype.updateChaseMovement = function() {
	if (this._smartPath === true) {
		if (this._stopCount > 0 && this._chasePlayer) {
			this.setTarget($gamePlayer);
		} else if (this._stopCount > 0 && this._fleePlayer) {
			this.moveAwayFromPlayer();
		} else {
			this.clearTarget();
			AndrewX.SECP.updateChaseMovement.call(this);
		}
	} else {
		this.clearTarget();
		AndrewX.SECP.updateChaseMovement.call(this);
	}
};