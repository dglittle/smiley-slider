function SmileySlider(container) {
    var track = document.getElementById(container);
    track.style.width = "329px";
    track.style.height = "6px";
    track.style.background = "no-repeat url(img/main.png) 0 0";
    track.style.padding = "20px 0 20px 0";    
    //create pointer
    myPointer = document.createElement('div');
    myPointer.setAttribute('id', 'pointer');
    myPointer.style.background= "url('img/main.png') repeat-x scroll 0 -122px transparent"
    myPointer.style.position = "absolute";
    myPointer.style.width = "40px";
    myPointer.style.height = "37px";
    myPointer.style.left = "0px";
    myPointer.style.top = "1px";
    //create canvas
    myCanvas = document.createElement('canvas');	  
    myCanvas.style.position = 'absolute';
    myCanvas.style.left="4px";
    myCanvas.style.top="0px";
    myCanvas.width = 41;
    myCanvas.height = 41;

    myPointer.appendChild(myCanvas);
    track.appendChild(myPointer);      

    var canvas = myCanvas;
    var pointer = myPointer;
    const PI180 = Math.PI / 180;
    var emotion = 0;
    var downOffset = 0;
    var lastPos = 0;
    this.callback = function(){};
    var that = this

    
    if (window.addEventListener)
    /** DOMMouseScroll is for mozilla. */
    window.addEventListener('DOMMouseScroll', wheelHandler, false);
    /** IE/Opera. */
    window.onmousewheel = document.onmousewheel = wheelHandler;


    document.onmouseup = function(e){
        document.onmousemove = null;
    }

    track.onmousedown = function(e){
        downOffset = (e.target == track) ? 0 : e.pageX - objectPosition(pointer)[0] - (pointer.clientWidth * 0.5);
        setPointer(e.pageX - track.offsetLeft);
        document.onmousemove = function(e2){
            setPointer(e2.pageX - track.offsetLeft);
        }
    }
    
    this.position =  function(amount)
    {
        
        if (amount)
        {
            if (typeof amount=="number")
            {
                if (amount > 1)
                {
                    setPointer(track.clientWidth);
                    return false;
                }
                else if (amount < 0)
                {
                    setPointer(0);
                    return false;
                }
                else
                    setPointer(track.clientWidth * amount);
            }
            else if(typeof amount=="function")
            {                
                this.callback = amount;
                
            }                      
                        
        }
        else 
        {       
            var pos = Math.round(lastPos/track.clientWidth * 100) / 100
            
            if (pos < 0)
                return 0
            if (pos > 1)
                return 1
            return pos
        
        }

    }

    function setPointer(value) {
       
        lastPos = value;
        var hPW = pointer.clientWidth * 0.5;
        var left = Math.max(0, Math.min(track.clientWidth, value)) - downOffset;
        var emotion = left / track.clientWidth;
        drawPointer(canvas, 100, emotion, 0.8);
        setProperty(pointer, 'left', left - hPW  + 'px');
        that.callback(that.position());
        
    }

    function deltaHandle(delta) {
        emotion += (delta > 0) ? 0.01 : -0.01;
        drawPointer(canvas, 100, emotion, 0.8);
    }

    function wheelHandler(event) {
        var delta = 0;
        if (!event) event = window.event; 
        
        if (event.wheelDelta) { 
            delta = event.wheelDelta / 120;
        }
        else if (event.detail) { 
            delta = -event.detail / 3;
        }
        if (delta && typeof deltaHandle == 'function') {
                deltaHandle(delta);
            if (event.preventDefault) {
                event.preventDefault();
                event.returnValue = false;
            }
        }
    }

    function drawPointer(canvas, radius, emotion, innerScale) {
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
        
        const PI180 = Math.PI / 180;	
        const SEGS = 16;
        
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

    function setProperty(target, propertyName, propertyValue){
        var allowProperty = (target.style.setProperty);
        if (allowProperty) {
            target.style.setProperty(propertyName, propertyValue, null);
        }
        else {
            target.style.setAttribute(propertyName, propertyValue);
        }
    }

    function objectPosition(obj) {
        var curleft = 0;
          var curtop = 0;
          if (obj.offsetParent) {
                do {
                      curleft += obj.offsetLeft;
                      curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
          }
          return [curleft, curtop];
    }

          setPointer(track.clientWidth * 0.5);

          return this;
  }

