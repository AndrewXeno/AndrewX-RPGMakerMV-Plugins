//=============================================================================
// AndrewX - Automatic Battle Camera
// AndrewX_AutomaticBattleCamera.js
//=============================================================================
var Imported = Imported || {};

var AndrewX = AndrewX || {};
AndrewX.ABC = AndrewX.ABC || {};
//=============================================================================
/*:
 * @plugindesc v0.10 Automatic focus camera on target in battle.
 * @author AndrewX
 *
 * @param Camera Frame Speed
 * @desc 镜头帧速，数字越小越快。默认10
 * @default 10
 *
 * @param Zoom In Rate
 * @desc 镜头放大率。正常大小1.0，默认放大到1.1
 * @default 1.1
 *
 * @param Zoom Out Rate
 * @desc 镜头拉远率，用于全屏动画。正常大小1.0，默认缩小到0.9
 * @default 0.9
 * 
 * @param Battleback Zoom Rate
 * @desc 背景增大率，避免默认素材背景在镜头移动后出现黑边所做的处理。默认1.3
 * @default 1.3
 *
 * @param Scale Battleback
 * @desc 战斗背景适应窗口。0: 不拉伸; 1: 仅在战斗背景小于屏幕尺寸时拉伸，2: 总是适应窗口。默认1
 * @default 1
 *
 * @param Zoom When Selecting
 * @desc 是否在选择目标时聚焦。true: 聚焦; false: 不聚焦。默认false
 * @default false
 *
 * @param Depth Sacle Rate
 * @desc 敌人近大远小比例，填入由空格分隔的两个小数，分别为最远(上)处比例和最近(下)处比例。默认0.5 1.2。不使用此功能则留空
 * @default 0.5 1.2
 * 
 * @help
 * ============================================================================
 * Introduction and Instructions
 * ============================================================================
 * 
 * 本插件实现纵版战斗镜头自动推进和拉远的效果。
 *
 * 仅适用于纵版战斗。
 *
 * Credit: 本插件思路来自芙蕾娅的VA脚本：
 * http://bbs.66rpg.com/home.php?mod=space&uid=310500&do=blog&id=13408
 * 加入选择目标时镜头跟随，战斗背景自适应，敌人近大远小功能。
 * 修正了动画位置跟随和伤害跳字跟随的问题。
 * 并且兼容Yanfly的战斗血条插件，兼容YEP_CoreEngine.js选中敌人不闪烁功能。
 *
 * 动画名称标签：
 * <NO CAMERA>
 * 如果动画名称中包含“<NO CAMERA>”（包括尖括号，必须大写），则该动画播放不会引发
 * 镜头效果。
 * 
 * ============================================================================
 * Changelog
 * ============================================================================
 *
 * Version 0.20:
 * - New: Add <NO CAMERA> in name of animations to disable camera movement for 
 *   these animations
 * - Modified: Zoom When Selecting parameter is set false as default now
 * - Minor bug fix
 * 
 * Version 0.10:
 * - Finished prototype
 *
 * ============================================================================
 * Term of Use
 * ============================================================================
 *
 * Free for use in non-commercial or commercial RMMV projects
 * Please credit AndrewX & 芙蕾娅
 * 
 */
//=============================================================================


(function() {

    var parameters = PluginManager.parameters('AndrewX_AutomaticBattleCamera');
    var cameraFrameSpeed = Number(parameters['Camera Frame Speed'] || 10);
    var zoomIn = Number(parameters['Zoom In Rate'] || 1.1);
    var zoomOut = Number(parameters['Zoom Out Rate'] || 0.9);
    var battlebackZoom = Number(parameters['Battleback Zoom Rate'] || 1.3);
    var scaleBattlebcak = Number(parameters['Scale Battleback'] || 1);
    var zoomSelect = parameters['Zoom When Selecting'] || "false"
    var depthScaleRate = (parameters['Depth Sacle Rate'] || "1.0 1.0").split(" ");
    depthScaleRate = (depthScaleRate.length < 2) ? [1, 1] : depthScaleRate;
    for (var i = 0; i < depthScaleRate.length; i++) {
        depthScaleRate[i] = Number(depthScaleRate[i]);
        depthScaleRate[i] = (depthScaleRate[i] === 0) ? 1 : depthScaleRate[i];
    };

    function Battle_Camera() {
        this.initialize.apply(this, arguments);
    };

    Battle_Camera.prototype.initialize = function() {
        this.x = Graphics.width / 2;
        this.y = Graphics.height / 2;
        this.newX = Graphics.width / 2;
        this.newY = Graphics.height / 2;
        this.centerWidth = Graphics.width / 2;
        this.centerHeight = Graphics.height / 2;
        this.zoom = 1.0;
        this.newZoom = 1.0;
        this.frameSpeed = cameraFrameSpeed;
        this.back1OriginalX = 0;
        this.back1OriginalY = 0;
        this.back2OriginalX = 0;
        this.back2OriginalY = 0;
    };

    Battle_Camera.prototype.resetFrameSpeed = function() {
        this.frameSpeed = cameraFrameSpeed;
    };

    Battle_Camera.prototype.focusOn = function(target, zoom, speed) {
        if (target.isEnemy()) {
            this.resetFrameSpeed();
            this.newX = target.screenX();

            var yOffset = 0;
            var enemySprites = BattleManager._spriteset._enemySprites;
            for (var i = 0; i < enemySprites.length; i++) {
                var sprite = enemySprites[i];
                if (target === sprite._battler) {
                    yOffset = sprite.height / 2;
                    break;
                }
            }
            var statusWindowHeight = 0;
            if (typeof SceneManager._scene._statusWindow !== "undefined") {
                statusWindowHeight = SceneManager._scene._statusWindow.height
            }

            this.newY = target.screenY() - yOffset + statusWindowHeight / 2; //调节基准点
            if (!(typeof zoom === "undefined")) {
                this.newZoom = zoom;
            }
            if (!(typeof speed === "undefined")) {
                this.frameSpeed = speed;
            }
        }
    };

    Battle_Camera.prototype.center = function(zoom) {
        this.newX = this.centerWidth;
        this.newY = this.centerHeight;
        if (!(zoom === undefined)) {
            this.newZoom = zoom;
        } else {
            this.newZoom = 1.0;
        }
    };

    Battle_Camera.prototype.battlerX = function(battler) {
        var distance = battler.screenX() - this.x;
        var value = distance * (this.zoom - 1.0);
        var pos = battler.screenX() - (this.x - this.centerWidth);
        return pos + value;
    };

    Battle_Camera.prototype.battlerY = function(battler) {
        var distance = battler.screenY() - this.y;
        var value = distance * (this.zoom - 1.0);
        var pos = battler.screenY() - (this.y - this.centerHeight);
        return pos + value;
    };

    Battle_Camera.prototype.update = function() {
        if (this.x != this.newX) {
            this.x = (this.newX - this.x > 0) ?
                Math.min(this.x + this.moveSpeedX(), this.newX) :
                Math.max(this.x - this.moveSpeedX(), this.newX);
        }
        if (this.y != this.newY) {
            this.y = (this.newY - this.y > 0) ?
                Math.min(this.y + this.moveSpeedY(), this.newY) :
                Math.max(this.y - this.moveSpeedY(), this.newY);
        }
        if (this.zoom != this.newZoom) {
            this.zoom = (this.newZoom - this.zoom > 0) ?
                Math.min(this.zoom + this.zoomSpeed(), this.newZoom) :
                Math.max(this.zoom - this.zoomSpeed(), this.newZoom);
        }
    };

    Battle_Camera.prototype.distanceX = function() {
        return Math.abs(this.x - this.newX);
    };

    Battle_Camera.prototype.distanceY = function() {
        return Math.abs(this.y - this.newY);
    };

    Battle_Camera.prototype.distanceZoom = function() {
        return Math.abs(this.zoom - this.newZoom);
    };

    Battle_Camera.prototype.moveSpeedX = function() {
        return Math.max(Math.floor(this.distanceX() / this.frameSpeed), 1);
    };

    Battle_Camera.prototype.moveSpeedY = function() {
        return Math.max(Math.floor(this.distanceY() / this.frameSpeed), 1);
    };

    Battle_Camera.prototype.zoomSpeed = function() {
        return Math.max(this.distanceZoom() / this.frameSpeed, 0.001);
    };

    AndrewX.ABC.updateCellSprite = Sprite_Animation.prototype.updateCellSprite;
    Sprite_Animation.prototype.updateCellSprite = function(sprite, cell) {
        var pattern = cell[0];
        if (pattern >= 0) {
            var sx = pattern % 5 * 192;
            var sy = Math.floor(pattern % 100 / 5) * 192;
            var mirror = this._mirror;
            sprite.bitmap = pattern < 100 ? this._bitmap1 : this._bitmap2;
            sprite.setFrame(sx, sy, 192, 192);
            sprite.x = cell[1];
            sprite.y = cell[2];
            if (this._mirror) {
                sprite.x *= -1;
            }
            if (typeof BattleManager._spriteset === "undefined") {
                var zoom = 1
            } else {
                var zoom = BattleManager._spriteset.battleCamera.zoom;
            }
            sprite.rotation = cell[4] * Math.PI / 180;
            sprite.scale.x = cell[3] / 100 * zoom; //here
            if ((cell[5] && !mirror) || (!cell[5] && mirror)) {
                sprite.scale.x *= -1;
            }
            sprite.scale.y = cell[3] / 100 * zoom; //here
            sprite.opacity = cell[6];
            sprite.blendMode = cell[7];
            sprite.visible = true;
        } else {
            sprite.visible = false;
        }
    };

    AndrewX.ABC.spritesetBattleInitialize = Spriteset_Battle.prototype.initialize;
    Spriteset_Battle.prototype.initialize = function() {
        this.battleCamera = new Battle_Camera();
        AndrewX.ABC.spritesetBattleInitialize.call(this);

    };

    AndrewX.ABC.spritesetBattleUpdate = Spriteset_Battle.prototype.update;
    Spriteset_Battle.prototype.update = function() {
        AndrewX.ABC.spritesetBattleUpdate.call(this);
        this.battleCamera.update();
        this.updateBattlebackPosition();
        this.updateEnemyPosition();
    };

    AndrewX.ABC.locateBattleback = Spriteset_Battle.prototype.locateBattleback;
    Spriteset_Battle.prototype.locateBattleback = function() {
        var width = this._battleField.width;
        var height = this._battleField.height;
        var sprite1 = this._back1Sprite;
        var sprite2 = this._back2Sprite;
        sprite1.origin.x = 0;
        sprite2.origin.x = 0;
        sprite1.origin.y = 0;
        sprite2.origin.y = 0;
        sprite1.anchor.x = 0.5;
        sprite1.anchor.y = 0.5;
        sprite2.anchor.x = 0.5;
        sprite2.anchor.y = 0.5;
        var x = this._battleField.width / 2;
        var y = this._battleField.height / 2;
        sprite1.move(x, y, sprite1.bitmap.width, sprite1.bitmap.height);
        sprite2.move(x, y, sprite2.bitmap.width, sprite2.bitmap.height);
        this.battleCamera.back1OriginalX = this._back1Sprite.x;
        this.battleCamera.back1OriginalY = this._back1Sprite.y;
        this.battleCamera.back2OriginalX = this._back2Sprite.x;
        this.battleCamera.back2OriginalY = this._back2Sprite.y;
    };

    Spriteset_Battle.prototype.updateBattlebackPosition = function() {
        var zoom = this.battleCamera.zoom * battlebackZoom;
        var sprite1 = this._back1Sprite;
        var sprite2 = this._back2Sprite;

        var back1ScaleX = 1;
        var back2ScaleX = 1;
        var back1ScaleY = 1;
        var back2ScaleY = 1;

        if (scaleBattlebcak === 1) {
            if (!(sprite1.bitmap.width <= 0 || sprite1.bitmap <= 0)) {
                back1ScaleX = Math.max(Graphics.boxWidth / sprite1.bitmap.width, 1);
                back1ScaleY = Math.max(Graphics.boxHeight / sprite1.bitmap.height, 1);
            }
            if (!(sprite2.bitmap.width <= 0 || sprite2.bitmap <= 0)) {
                back2ScaleX = Math.max(Graphics.boxWidth / sprite2.bitmap.width, 1);
                back2ScaleY = Math.max(Graphics.boxHeight / sprite2.bitmap.height, 1);
            }
        } else if (scaleBattlebcak === 2) {
            if (!(sprite1.bitmap.width <= 0 || sprite1.bitmap <= 0)) {
                back1ScaleX = Graphics.boxWidth / sprite1.bitmap.width;
                back1ScaleY = Graphics.boxHeight / sprite1.bitmap.height;
            }
            if (!(sprite2.bitmap.width <= 0 || sprite2.bitmap <= 0)) {
                back2ScaleX = Graphics.boxWidth / sprite2.bitmap.width;
                back2ScaleY = Graphics.boxHeight / sprite2.bitmap.height;
            }
        }

        sprite1.scale.x = zoom * back1ScaleX;
        sprite1.scale.y = zoom * back1ScaleY;
        sprite2.scale.x = zoom * back2ScaleX;
        sprite2.scale.y = zoom * back1ScaleY;

        var camera = this.battleCamera;
        var cameraDistX = this.battleCamera.x - this.battleCamera.centerWidth;
        var cameraDistY = this.battleCamera.y - this.battleCamera.centerHeight;
        sprite1.x = camera.back1OriginalX - cameraDistX;
        sprite1.y = camera.back1OriginalY - cameraDistY;
        sprite2.x = camera.back2OriginalX - cameraDistX;
        sprite2.y = camera.back2OriginalY - cameraDistY;
    };

    Spriteset_Battle.prototype.updateEnemyPosition = function() {
        for (var i = 0; i < this._enemySprites.length; i++) {
            var sprite = this._enemySprites[i];

            var statusWindowHeight = 0;
            if (typeof SceneManager._scene._statusWindow !== "undefined") {
                statusWindowHeight = SceneManager._scene._statusWindow.height
            }
            var fieldHeight = Graphics.boxHeight - statusWindowHeight;

            var minScale = Math.min(depthScaleRate[0], depthScaleRate[1]);
            var maxScale = Math.max(depthScaleRate[0], depthScaleRate[1]);

            var depthScale = minScale + (maxScale - minScale) * sprite.y / fieldHeight;
            sprite.scale.x = this.battleCamera.zoom * depthScale;
            sprite.scale.y = this.battleCamera.zoom * depthScale;
            sprite.x = this.battleCamera.battlerX(sprite._battler);
            sprite.y = this.battleCamera.battlerY(sprite._battler);
        }
    };


    AndrewX.ABC.invokeAction = BattleManager.invokeAction;
    BattleManager.invokeAction = function(subject, target) {
        AndrewX.ABC.invokeAction.call(this, subject, target);
        BattleManager._spriteset.battleCamera.center();
    };

    AndrewX.ABC.showNormalAnimation = Window_BattleLog.prototype.showNormalAnimation;
    Window_BattleLog.prototype.showNormalAnimation = function(targets, animationId, mirror) {
        var animation = $dataAnimations[animationId];
        if (animation && !animation.name.match("<NO CAMERA>")) {
            var delay = this.animationBaseDelay();
            var nextDelay = this.animationNextDelay();
            if (targets.length > 1) {
                targets.forEach(function(target) {
                    if (target.isEnemy()) {
                        BattleManager._spriteset.battleCamera.center(zoomOut);
                    }
                    target.startAnimation(animationId, mirror, delay);
                    delay += nextDelay;
                });
            } else {
                targets.forEach(function(target) {
                    if (target.isEnemy() && animation.position !== 3) {
                        BattleManager._spriteset.battleCamera.focusOn(target, zoomIn);
                    }
                    if (target.isEnemy() && animation.position === 3) {
                        BattleManager._spriteset.battleCamera.center(zoomOut);
                    }
                    target.startAnimation(animationId, mirror, delay);
                    delay += nextDelay;
                });
            }
        } else {
            AndrewX.ABC.showNormalAnimation.call(this, targets, animationId, mirror);
        }
    };

    AndrewX.ABC.updateSelectionEffect = Sprite_Battler.prototype.updateSelectionEffect;
    Sprite_Battler.prototype.updateSelectionEffect = function() {
        if (zoomSelect.toUpperCase() === "TRUE") {
            var target = this._effectTarget;
            if (this._battler.isSelected()) {
                this._selectionEffectCount++;
                if (target instanceof Sprite_Enemy) {
                    var camera = BattleManager._spriteset.battleCamera;
                    camera.focusOn(target._battler, zoomIn);
                }
                if (this._selectionEffectCount % 30 < 15) {
                    target.setBlendColor([255, 255, 255, 64]);
                } else {
                    target.setBlendColor([0, 0, 0, 0]);
                }
            } else if (this._selectionEffectCount > 0) {
                this._selectionEffectCount = 0;
                BattleManager._spriteset.battleCamera.center();
                target.setBlendColor([0, 0, 0, 0]);
            }
        } else {
            AndrewX.ABC.updateSelectionEffect.call(this);
        }
    };

    AndrewX.ABC.updateDamagePopup = Sprite_Battler.prototype.updateDamagePopup;
    Sprite_Battler.prototype.updateDamagePopup = function() {
        if (this._battler.isEnemy()) {
            this.setupDamagePopup();
            if (this._damages.length > 0) {
                for (var i = 0; i < this._damages.length; i++) {
                    var camera = BattleManager._spriteset.battleCamera;
                    var battlerX = camera.battlerX(this._battler);
                    var battlerY = camera.battlerY(this._battler);
                    this._damages[i].x = battlerX + this.damageOffsetX();
                    this._damages[i].y = battlerY + this.damageOffsetY();
                    this._damages[i].update();
                }
                if (!this._damages[0].isPlaying()) {
                    this.parent.removeChild(this._damages[0]);
                    this._damages.shift();
                }
            }
        } else {
            AndrewX.ABC.updateDamagePopup.call(this);
        }
    };

    AndrewX.ABC.updateAnimationPosition = Sprite_Animation.prototype.updatePosition;
    Sprite_Animation.prototype.updatePosition = function() {
        if (this._target._battler.isEnemy()) {
            if (this._animation.position === 3) {
                this.x = this.parent.width / 2;
                this.y = this.parent.height / 2;
            } else {
                var parent = this._target.parent;
                var grandparent = parent ? parent.parent : null;
                var camera = BattleManager._spriteset.battleCamera;
                var battlerX = camera.battlerX(this._target._battler);
                var battlerY = camera.battlerY(this._target._battler);
                this.x = battlerX;
                this.y = battlerY;
                if (this.parent === grandparent) {
                    this.x += parent.x;
                    this.y += parent.y;
                }
                if (this._animation.position === 0) {
                    this.y -= this._target.height;
                } else if (this._animation.position === 1) {
                    this.y -= this._target.height / 2;
                }
            }
        } else {
            AndrewX.ABC.updateAnimationPosition.call(this);
        }
    };

    if (Imported.YEP_X_VisualHpGauge) {
        AndrewX.ABC.updateVisualHPGaugeWindowPosition = Window_VisualHPGauge.prototype.updateWindowPosition;
        Window_VisualHPGauge.prototype.updateWindowPosition = function() {
            if (!this._battler) return;
            if (this._battler.isEnemy()) {
                var battler = this._battler;
                var camera = BattleManager._spriteset.battleCamera;
                var battlerX = camera.battlerX(battler);
                var battlerY = camera.battlerY(battler);
                this.x = battlerX;
                this.x -= Math.ceil(this.width / 2);
                this.x = this.x.clamp(this._minX, this._maxX);
                this.y = battlerY;
                if (Yanfly.Param.VHGGaugePos) {
                    this.y -= battler.spriteHeight();
                } else {
                    this.y -= this.standardPadding();
                }
                this.y = this.y.clamp(this._minY, this._maxY);
                this.y += Yanfly.Param.VHGBufferY;
            } else {
                AndrewX.ABC.updateVisualHPGaugeWindowPosition.call(this);
            }
        };
    }

    if (Imported.YEP_BattleEngineCore) {
        Window_EnemyVisualSelect.prototype.updateWindowSize = function() {
            var spriteWidth = this._battler.spriteWidth();
            this.contents.fontSize = Yanfly.Param.BECEnemyFontSize;
            var textWidth = this.textWidth(this._battler.name());
            textWidth += this.textPadding() * 2;
            var width = textWidth + this.standardPadding() * 2;
            var height = this.lineHeight() + this.standardPadding() * 2;
            if (width === this.width && height === this.height) return;
            this.width = width;
            this.height = height;
            this.createContents();
            this._requestRefresh = true;
            this.makeWindowBoundaries();
        };
    }

    if (Imported.YEP_CoreEngine) {
        if (!eval(Yanfly.Param.FlashTarget)) {
            AndrewX.ABC.updateSelectionEffect_YanflyFix = Sprite_Battler.prototype.updateSelectionEffect;
            Sprite_Battler.prototype.updateSelectionEffect = function() {
                if (zoomSelect.toUpperCase() === "TRUE") {
                    var target = this._effectTarget;
                    if (this._battler.isSelected()) {
                        this._selectionEffectCount++;
                        if (target instanceof Sprite_Enemy) {
                            var camera = BattleManager._spriteset.battleCamera;
                            camera.focusOn(target._battler, zoomIn);
                        }
                        if (this._battler.isActor()) {
                            AndrewX.ABC.updateSelectionEffect_YanflyFix.call(this);
                        } else {
                            if (this._battler.isSelected()) this.startEffect('whiten');
                        }
                    } else if (this._selectionEffectCount > 0) {
                        this._selectionEffectCount = 0;
                        BattleManager._spriteset.battleCamera.center();
                        target.setBlendColor([0, 0, 0, 0]);
                    }
                } else {
                    AndrewX.ABC.updateSelectionEffect_YanflyFix.call(this);
                }
            };
        };
    }
})();