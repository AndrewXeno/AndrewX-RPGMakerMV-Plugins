//=============================================================================
// AndrewX - Layered Animation
// AndrewX_LayeredAnimation.js
//=============================================================================
var AndrewX = AndrewX || {};
AndrewX.LA = AndrewX.LA || {};
//=============================================================================
/*:
 * @plugindesc v0.10 Enable animations to be displayed on the same layers as its target. (except for Screen Animations)
 * @author AndrewX
 * 
 * @help
 * ============================================================================
 * Introduction and Instructions
 * ============================================================================
 *
 * No need for any configuration.
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

AndrewX.LA.startAnimation = Sprite_Base.prototype.startAnimation;
Sprite_Base.prototype.startAnimation = function(animation, mirror, delay) {
    var sprite = new Sprite_Animation();
    sprite.setup(this._effectTarget, animation, mirror, delay);
    //this.parent.addChild(sprite);  Changed to:
    if(animation.position === 3){
        this.parent.addChild(sprite);
    } else {
        this.addChild(sprite);
    }
    //modification done
    this._animationSprites.push(sprite);
};

AndrewX.LA.updatePosition = Sprite_Animation.prototype.updatePosition
Sprite_Animation.prototype.updatePosition = function() {
    if (this._animation.position === 3) {
        this.x = this.parent.width / 2;
        this.y = this.parent.height / 2;
    } else {
        var parent = this._target.parent;
        var grandparent = parent ? parent.parent : null;
        this.x = 0; //original: this.x = this._target.x
        this.y = 0; //original: this.y = this._target.y
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
};