//=============================================================================
// AndrewX - Prettified Gauge
// AndrewX_PrettifiedGauge.js
//=============================================================================
var AndrewX = AndrewX || {};
AndrewX.PG = AndrewX.PG || {};
//=============================================================================
/*:
 * @plugindesc v0.10 Makes gauges in game prettier.
 * @author AndrewX
 * 
 * @help
 * ============================================================================
 * Introduction and Instructions
 * ============================================================================
 *
 * Hard coded, no need for any configuration.
 *
 * Credit: This plugin is inspired by the MrLiu_MapStatus.js by MrLiu.
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

	Bitmap.prototype.outlineTrap = function(x, y, width, height, color1, color2) {
		var context = this._context;
		var grad = context.createLinearGradient(x, y, x + width, y);
		grad.addColorStop(0, color1);
		grad.addColorStop(1, color2);
		context.save();
		context.lineWidth = parseInt(height * 0.2 / 2) * 2;
		context.shadowBlur = 5;
		context.shadowColor = "rgba(0, 0, 0, 1)";
		context.shadowOffsetY = 0;
		context.beginPath();
		context.moveTo(x, y + height);
		context.lineTo(x, y);
		context.lineTo(x + width, y);
		context.lineTo(x + width, y + height);
		context.closePath();
		context.strokeStyle = grad;
		context.stroke();
		context.restore();
		this._setDirty();
	};


	Bitmap.prototype.fillTrap = function(x, y, width, widthpart, height, color1, color2) {
		var context = this._context;
		var grad = context.createLinearGradient(x, y, x + widthpart, y);
		grad.addColorStop(0, color1);
		grad.addColorStop(1, color2);
		context.save();
		context.beginPath();
		context.moveTo(x, y + height);
		context.lineTo(x, y);
		context.lineTo(x + widthpart, y);
		context.lineTo(x + widthpart, y + height);
		context.closePath();
		context.clip();
		context.fillStyle = grad;
		context.fillRect(x, y, widthpart, height);
		context.restore();
		this._setDirty();
	};


	Bitmap.prototype.outlineTrapR = function(x, y, width, height, color1, color2) {
		var context = this._context;
		var grad = context.createLinearGradient(x, y, x + width, y);
		grad.addColorStop(0, color1);
		grad.addColorStop(1, color2);
		context.save();
		context.lineWidth = 2;
		context.shadowBlur = 5;
		context.shadowColor = "rgba(0, 0, 0, 1)";
		context.shadowOffsetY = 0;
		context.beginPath();
		context.moveTo(x, y + height);
		context.lineTo(x + height, y);
		context.lineTo(x + width, y);
		context.lineTo(x + width - height, y + height);
		context.closePath();
		context.strokeStyle = grad;
		context.stroke();
		context.restore();
		this._setDirty();
	};


	Bitmap.prototype.fillTrapR = function(x, y, width, widthpart, height, color1, color2) {
		var context = this._context;
		var grad = context.createLinearGradient(x, y, x + widthpart, y);
		grad.addColorStop(0, color1);
		grad.addColorStop(1, color2);
		context.save();
		context.beginPath();
		context.moveTo(x, y + height);
		context.lineTo(x + height, y);
		context.lineTo(x + widthpart, y);
		context.lineTo(x + widthpart - height, y + height);
		context.closePath();
		context.clip();
		context.fillStyle = grad;
		context.fillRect(x, y, widthpart, height);
		context.restore();
		this._setDirty();
	};


	Bitmap.prototype.outlineTrapL = function(x, y, width, height, color1, color2) {
		var context = this._context;
		var grad = context.createLinearGradient(x, y, x + width, y);
		grad.addColorStop(0, color1);
		grad.addColorStop(1, color2);
		context.save();
		context.lineWidth = parseInt(height * 0.2 / 2) * 2;
		context.shadowBlur = 5;
		context.shadowColor = "rgba(0, 0, 0, 1)";
		context.shadowOffsetY = 0;
		context.beginPath();
		context.moveTo(x + height, y + height);
		context.lineTo(x, y);
		context.lineTo(x + width - height, y);
		context.lineTo(x + width, y + height);
		context.closePath();
		context.strokeStyle = grad;
		context.stroke();
		context.restore();
		this._setDirty();
	};


	Bitmap.prototype.fillTrapL = function(x, y, width, widthpart, height, color1, color2) {
		var context = this._context;
		var grad = context.createLinearGradient(x, y, x + widthpart, y);
		grad.addColorStop(0, color1);
		grad.addColorStop(1, color2);
		context.save();
		context.beginPath();
		context.moveTo(x + height, y + height);
		context.lineTo(x, y);
		context.lineTo(x + widthpart - height, y);
		context.lineTo(x + widthpart, y + height);
		context.closePath();
		context.clip();
		context.fillStyle = grad;
		context.fillRect(x, y, widthpart, height);
		context.restore();
		this._setDirty();
	};

	AndrewX.PG.drawGauge = Window_Base.prototype.drawGauge;
	Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
		var height = this.gaugeHeight();
		var style = 1;
		switch (style) {
			case 1:
				var fillW = Math.floor((width - height) * rate) + height;
				var gaugeY = y + this.lineHeight() - height - 2;
				this.contents.fillTrapR(x, gaugeY, width, width, height, this.textColor(19), this.textColor(19));
				this.contents.fillTrapR(x, gaugeY, width, fillW, height, color1, color2);
				this.contents.outlineTrapR(x, gaugeY, width, height, "#FFFFFF", "#FFFFFF");
				break;
			case 2:
				var fillW = Math.floor((width - height) * rate) + height;
				var gaugeY = y + this.lineHeight() - height - 2;
				this.contents.fillTrapL(x, gaugeY, width, width, height, this.textColor(19), this.textColor(19));
				this.contents.fillTrapL(x, gaugeY, width, fillW, height, color1, color2);
				this.contents.outlineTrapL(x, gaugeY, width, height, "#FFFFFF", "#FFFFFF");
				break;
			default:
				var fillW = Math.floor(width * rate);
				var gaugeY = y + this.lineHeight() - height - 2;
				this.contents.fillTrap(x, gaugeY, width, width, height, this.textColor(19), this.textColor(19));
				this.contents.fillTrap(x, gaugeY, width, fillW, height, color1, color2);
				this.contents.outlineTrap(x, gaugeY, width, height, "#FFFFFF", "#FFFFFF");
				break;
		}
	};


	//Yanfly ATB Gauge fix
	Window_BattleStatus.prototype.redrawATB = function() {
		if (this.isATBGaugeStyle(0)) return;
		var rect;
		for (var i = 0; i < $gameParty.battleMembers().length; ++i) {
			var actor = $gameParty.battleMembers()[i];
			if (this.isATBGaugeStyle(1)) {
				rect = this.basicAreaRect(i);
				this.contents.clearRect(rect.x - 7, rect.y, rect.width + 14, rect.height);
				this.drawBasicArea(rect, actor);
			} else if (this.isATBGaugeStyle(2)) {
				this.redrawATBGaugeRect(i, actor);
			}
		}
	};

	Window_BattleStatus.prototype.redrawATBGaugeRect = function(index, actor) {
		var rect = this.gaugeAreaRect(index);
		var clrect = this.gaugeAreaRect(index);
		var totalArea = this.gaugeAreaWidth();
		if ($dataSystem.optDisplayTp) {
			var gw = totalArea / 4 - 15;
			clrect.x = rect.x + gw * 3 + 44;
			clrect.y = rect.y;
			clrect.width = gw + 2;
			this.contents.clearRect(clrect.x, clrect.y, clrect.width, clrect.height);
			this.drawActorAtbGauge(actor, rect.x + gw * 3 + 45, rect.y, gw);
		} else {
			totalArea -= 30;
			var hpW = parseInt(totalArea * 108 / 300);
			var otW = parseInt(totalArea * 96 / 300);
			clrect.x = rect.x + hpW + otW + 29;
			clrect.y = rect.y;
			clrect.width = otW + 2;
			this.contents.clearRect(clrect.x, clrect.y, clrect.width, clrect.height);
			this.drawAtbChargeGauge(actor, rect.x + hpW + otW + 30, rect.y, otW);
		}
	};

	Window_Base.prototype.drawAtbChargeGauge = function(actor, wx, wy, ww) {
		var color1 = this.textColor(Yanfly.Param.ATBColorChar1);
		var color2 = this.textColor(Yanfly.Param.ATBColorChar2);
		var color3 = this.atbGaugeColor1(actor);
		var color4 = this.atbGaugeColor2(actor);
		var rate = actor.atbChargeRate();
		var height = this.gaugeHeight();
		var fillW = Math.floor((ww - height) * rate) + height;
		var gaugeY = wy + this.lineHeight() - height - 2;
		this.contents.fillTrapR(wx, gaugeY, ww, ww, height, color3, color4);
		this.contents.fillTrapR(wx, gaugeY, ww, fillW, height, color1, color2);
		this.contents.outlineTrapR(wx, gaugeY, ww, height, "#FFFFFF", "#FFFFFF");
	};

})();