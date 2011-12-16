
function SmileySlider(container, imgSrc) {
    if (!imgSrc)
        imgSrc = "smiley-slider.png"

    var width = 329
    var height = 37
    
    var headWidth = 40
    var maxHeadX = width - headWidth + 1
    
    var base = document.createElement('div')
    base.style.width = width + "px"
    base.style.height = height + "px"
    base.style.background = "white"
    
    var track = document.createElement('div')
    track.style.width = width + "px"
    track.style.height = 6 + "px"
    track.style.marginRight = '-' + track.style.width
    track.style.marginBottom = '-' + track.style.height
    track.style.position = "relative"
    track.style.top = 15 + "px"
    track.style.background = "url('" + imgSrc + "')"
    base.appendChild(track)
    
    var head = document.createElement('div')
    head.style.width = headWidth + "px"
    head.style.height = height + "px"
    head.style.marginRight = '-' + head.style.width
    head.style.marginBottom = '-' + head.style.height
    head.style.position = "relative"
    head.style.background = "url('" + imgSrc + "') scroll 0px -6px"
    base.appendChild(head)

    var face = document.createElement('canvas')
    face.style.width = 36 + "px"
    face.style.height = 37 + "px"
    face.style.position = "relative"
    face.style.left = 4 + "px"
    face.width = "36"
    face.height = "37"
    head.appendChild(face)
    
    var glass = document.createElement('div')
    glass.style.width = width + "px"
    glass.style.height = height + "px"
    glass.style.marginRight = '-' + glass.style.width
    glass.style.marginBottom = '-' + glass.style.height
    glass.style.position = "relative"
    base.appendChild(glass)
    
    container.appendChild(base)

    //////////////////////////////////////////////////////////////
    // head position
    
    var onHeadMove = null
    
    function positionInt(e) {
        if (e === undefined) {
            return getPos(head).x - getPos(base).x
        } else {
            head.style.left = Math.round(cap(e, 0, maxHeadX)) + "px"
            var p = position()
            drawFace(face, 100, p, 0.8)
            if (onHeadMove) onHeadMove(p)
        }
    }
    
    function position(e) {
        if (e === undefined) {
            return lerp(0, 0, maxHeadX, 1, positionInt())
        } else if (typeof(e) == "function") {
            onHeadMove = e
        } else {
            positionInt(lerp(0, 0, 1, maxHeadX, e))
        }
    }
    
    this.position = position    
    setTimeout(function () {
        position(0.5)
    }, 0)

    //////////////////////////////////////////////////////////////
    // mouse

    glass.onmousedown = function (e) {
        e.preventDefault()
        var pos = getRelPos(glass, e)
        
        var grabX = headWidth / 2
        var headX = positionInt()
        if (pos.x >= headX && pos.x < headX + headWidth) {
            grabX = pos.x - headX
        }
        
        positionInt(pos.x - grabX)

        var oldMove = document.onmousemove
        document.onmousemove = function (e) {
            var pos = getRelPos(glass, e)
            
            positionInt(pos.x - grabX)
        }
        
        var oldUp = document.onmouseup
        document.onmouseup = function (e) {
            document.onmousemove = oldMove
            document.onmouseup = oldUp
        }
    }

    //////////////////////////////////////////////////////////////
    // touch

    glass.ontouchstart = function (e) {
        e.preventDefault()
        var pos = getRelPos(glass, e.touches[0])

        var grabX = headWidth / 2
        var headX = positionInt()
        if (pos.x >= headX && pos.x < headX + headWidth) {
            grabX = pos.x - headX
        }

        positionInt(pos.x - grabX)

        var oldMove = document.ontouchmove
        document.ontouchmove = function (e) {
            e.preventDefault();
            var pos = getRelPos(glass, e.touches[0])
            positionInt(pos.x - grabX)
        }

        var oldEnd = document.ontouchend;
        var oldCancel = document.ontouchcancel
        document.ontouchend = document.ontouchcancel = function (e) {
            document.ontouchmove = oldMove
            document.ontouchend = oldEnd
            document.ontouchcancel = oldCancel;
        }
    }

    //////////////////////////////////////////////////////////////
    // core drawing code
    
    var PI180 = Math.PI / 180;
	
    function drawFace(canvas, radius, emotion, innerScale) {
        emotion = Math.max(0, Math.min(1, emotion));
        var diam = radius * 2;
        
        var ctx = canvas.getContext('2d');
        ctx.clearRect (0, 0, diam, diam);

        ctx.beginPath();
        ctx.fillStyle = '#414084'; 
        drawSmile(ctx, 15.5, 20, innerScale, emotion);
        ctx.closePath();
        ctx.fill();
        
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#414084';
        drawEyeBrows(ctx, 9.5, 16, 23, 16, 7, 5, emotion);
        ctx.stroke();
    };

    function drawSmile(context, mainRadius, offsetY, innerScale, emotion) {
        var eased = 1 - easeInQuad(emotion, 0, 1, 1);
        var innerScale = innerScale - (eased * 0.4);
        var curveOffset = easeInCubic(emotion, 0.1, 0.6, 1);
        drawArc(context, mainRadius, offsetY, innerScale, emotion);
        drawArc(context, mainRadius, offsetY, innerScale, emotion, curveOffset, true);
    }

    function easeInCubic(t, b, c, d) {
        return c*(t/=d)*t*t + b;
    }

    function easeInQuad(t, b, c, d) {
        return c*(t/=d)*t + b;
    }

    function drawArc(context, mainRadius, offsetY, innerScale, emotion, curveOffset, reverseX) {
        curveOffset = (curveOffset === undefined) ? 0 : curveOffset;
        
        var innerRadius = mainRadius * innerScale;
        var pad = mainRadius - innerRadius;
        var diam = innerRadius * 2;
        
        var SEGS = 16;
        
        var theta = 360 / SEGS;
        var emoScale = (emotion - 0.5) * 2;
        
        var sides = [pad, pad + diam];
        var ct = [[0, 0], [0, 0]];
        
        ct[0][0] = innerRadius * Math.cos((theta * 3) * PI180) + pad ;
        ct[0][1] = innerRadius * Math.sin((theta * 3) * PI180) * emoScale + offsetY + pad - (curveOffset * mainRadius);
        
        ct[1][0] = innerRadius * Math.cos((theta * 5) * PI180) + pad + (innerRadius * 2);
        ct[1][1] = innerRadius * Math.sin((theta * 5) * PI180) * emoScale + offsetY + pad - (curveOffset * mainRadius);
        
        if (reverseX) {
            sides.reverse();
            ct.reverse();
        }
        
        context.moveTo(sides[0], offsetY + pad);
        context.bezierCurveTo(ct[0][0], ct[0][1], ct[1][0], ct[1][1], sides[1], offsetY + pad);
    }

    function drawEyeBrows(context, x1, y1, x2, y2, width, distance, emotion) {
        var a = (emotion - 0.5) * 30;
        var hW = width * 0.5;
        
        var l1 = rotZ(-hW, -distance, -a);
        var l2 = rotZ(hW , -distance, -a);
        
        var r1 = rotZ(-hW, -distance, a);
        var r2 = rotZ(hW , -distance, a);
        
        context.moveTo(l1[0] + x1, l1[1] + y1);
        context.lineTo(l2[0] + x1, l2[1] + y1);
        
        context.moveTo(r1[0] + x2, r1[1] + y2);
        context.lineTo(r2[0] + x2, r2[1] + y2);
    }

    function rotZ(x, y, angle) {
        var cos = Math.cos(angle * PI180);
        var sin = Math.sin(angle * PI180);
        var tx = x * cos - y * sin;
        var ty = x * sin + y * cos;
        return [tx, ty];
    }
    
    //////////////////////////////////////////////////////////////
    // utils
    
    function cap(t, mi, ma) {
        if (t < mi) return mi
        if (t > ma) return ma
        return t
    }

    function lerp(t0, v0, t1, v1, t) {
        return (t - t0) * (v1 - v0) / (t1 - t0) + v0
    }
    
    function getPos(e) {
        var x = 0, y = 0
        while (e != null) {
            x += e.offsetLeft
            y += e.offsetTop
            e = e.offsetParent
        }
        return {x : x, y : x}
    }
    
    function getRelPos(to, positionedObject) {
        var pos = getPos(to)
        return {
            x : positionedObject.pageX - pos.x,
            y : positionedObject.pageY - pos.y
        }
    }
}

