/**
 * @ngDoc directive
 * @name ng.directive:slider
 * @author gaoyangyang
 * @description
 * A directive to make it ease to choose number from a continuous range.
 *
 * @element EA
 *
 */
 angular.module('slider', []).directive('slider', function () {

     /**
      * The angular return value required for the directive
      * Feel free to tweak / fork values for your application
      */
     return {

         // Restrict to elements and attributes
         restrict: 'EA',

         // Assign the angular link function
         link: slideLink,

         // Assign the angular scope attribute formatting
         scope: {
             min: '@',
             max: '@',
             from: '=',
             to: '=',
             single: '@',
             hideFromTo: '@',
             hideMinMax: '@',
             hideText: '@',
         },

         // Assign the angular directive template HTML
         template:
             '<span class="slider slider-body" tabindex="0"> ' +
                '<span class="min-num">'+
                  '<span class="text">{{ min }}</span>'+
                '</span>'+
                '<span class="slider-line-before"></span>'+
                '<span class="slider-line"></span>'+
                '<span class="slider-line-after"></span>'+
                '<span class="max-num">'+
                  '<span class="text">{{ max }}</span>'+
                '</span>'+
                '<span class="slider-bar"></span>'+
                '<span class="left-container">'+
                  '<span class="sign-num left">'+
                    '<span class="text">{{ from }}</span>'+
                  '</span>'+
                  '<span class="slider-bar-from slider-hander"></span>'+
                '</span>'+
                '<span class="right-container">'+
                  '<span class="slider-bar-to slider-hander"></span>'+
                  '<span class="sign-num right">'+
                    '<span class="text">{{ to }}</span>'+
                  '</span>'+
                '</span>'+
             '</span>'
     };


     /**
      * Link the directive to enable our scope watch values
      *
      * @param {object} scope - Angular link scope
      * @param {object} el - Angular link element
      * @param {object} attrs - Angular link attribute
      */
     function slideLink(scope, el, attrs) {
        // Hook in our watched items
         build(scope, el, attrs);
     }

     /**
      * The main build function used to determine the paging logic
      * Feel free to tweak / fork values for your application
      *
      * @param {Object} scope - The local directive scope object
      * @param {Object} attrs - The local directive attribute object
      */
     function build(scope, el, attrs) {

         var sliderBody = el.find('.slider-body');
         var leftContainer = el.find('.left-container');
         var rightContainer = el.find('.right-container');
         var hander = el.find('.slider-hander');
         var leftBtn = el.find('.slider-bar-from.slider-hander');
         var rightBtn = el.find('.slider-bar-to.slider-hander');
         var sliderBar = el.find('.slider-bar');
         var slideLine = el.find('.slider-line');
         var leftSign = el.find('.sign-num.left');
         var rightSign = el.find('.sign-num.right');


         leftContainer.data('type', 'left');
         rightContainer.data('type', 'right');


         var line ={
             x: slideLine.offset().left,
             y: slideLine.offset().left+slideLine.width(),
             w: slideLine.width(),
             bar: sliderBar
         }


         // avoid  negative number or none
         if (!scope.min || scope.min <= 0) {
             scope.min = 0;
         }
         if(!scope.max || scope.max <= 0){
             scope.max = 100;
         }

         if(!scope.to || scope.to <=0){
             scope.to= scope.max;
         }
         if(scope.to > scope.max){
            scope.to = scope.max;
         }
         if(!scope.single){
           if(!scope.from || scope.from <=0){
               scope.from = scope.min;
           }
           if(scope.from > scope.max){
             scope.from = scope.max;
           }
         }
         if(scope.single){
           scope.from = 0;
         }


         var option={
             min: scope.min,
             max: scope.max,
             from: scope.from,
             to: scope.to,
             sums: scope.max - scope.min,
             single: scope.single== "false " ? true : false,
             hideText: scope.hideText == 'true' ? true : false,
             hideMinMax: scope.hideMinMax == 'true' ? true : false,
             hideFromTo: scope.hideFromTo == 'true' ? true : false,
         }

         var init={};//用于每次mousedown事件中hander的位置的初始化
         var target=null;
         var currentType = null;//当move事件触发时，判定移动哪个btn容器(left-container right-container)

         //防止鼠标移动时文字被选中
         //TODO 不知道这样对不对
         if(document.selection){//IE ,Opera
           if(document.selection.empty)
                   document.selection.empty();//IE
           else{//Opera
                   document.selection = null;
          }
        }else if(window.getSelection){//FF,Safari
           window.getSelection().removeAllRanges();
        }

         //如果single为true 移除left-container
         removeLeftBtn(option.single);

         //移除不需要的text
         removeText([option.hideText, option.hideMinMax, option.hideFromTo]);

         //初始化按钮容器位置
         initPosition();

         sliderBody.focus(function(e){
            var that = angular.element(this);
            that.addClass('active');
         })
         sliderBody.blur(function(e){
           var that = angular.element(this);
           that.removeClass('active');
         })

         sliderBody.on('mousedown', change);


         rightContainer.on('mousedown', function(e){

            currentType = 'right';
            change(e, true);
            e.stopPropagation();
         });

         leftContainer.on('mousedown', function(e){

           currentType = 'left';
           change(e, true);
           e.stopPropagation();
         })

         angular.element(document).on('mousemove.slider', function(e){
           var newPoint = e.clientX;
           var type = currentType;

           if(init.move){
              startMove(e, type, newPoint);
           }

         });
         angular.element(document).on('mouseup.slider', stopMove);


/*
* 下面是主要的功能函数
*/
        function startMove(e, type, newPoint){

            e = e || window.event;
            var target = e;
            if(!init.drag) return;

            switch(type){
                case 'left':
                     moveLeftBar();
                     break;
                case 'right':
                     moveRightBar();
                     break;
             }
            function updateCPosition(target, oldPoint){
                var len = Math.abs(newPoint - oldPoint); //移动的距离
                var percentLeft = (newPoint-line.x)/line.w
                percentLeft*=100;

                var css={
                    'left': percentLeft+'%'
                    }
                target.css(css);
              }
            function moveLeftBar(){
              newPoint = newPoint >= init.rX ? init.rX-1 : newPoint
              newPoint = newPoint <= line.x ? line.x : newPoint
              updateCPosition(leftContainer, init.lX);

              var percentWidth = (init.rX - newPoint) / line.w;
              percentWidth*=100;
              var percentLeft= (newPoint - line.x) / line.w;
              percentLeft*=100;
              var css={
                  'width': percentWidth+'%',
                  'left': percentLeft+'%'
              }
              line.bar.css(css);
              //更新scope.from
              scope.from = parseInt((newPoint-line.x)/line.w*100*(scope.max-scope.min)/100)+parseInt(scope.min);
              scope.from = Math.max(scope.min, scope.from);
              scope.$apply();

            }
          function moveRightBar(){
              newPoint = newPoint <= init.lX ? init.lX+1 : newPoint
              newPoint = newPoint >= line.y ? line.y : newPoint
              updateCPosition(rightContainer, init.rX);
              var percentWidth=((newPoint-init.lX)/line.w);
              percentWidth*=100;

              var css={
                    'width': percentWidth+'%'
                  }
             line.bar.css(css);
             //更新scope.to
             scope.to = parseInt((newPoint-line.x)/line.w*100*(scope.max-scope.min)/100)+parseInt(scope.min);
             scope.to = Math.min(scope.to, scope.max);
             scope.$apply();
             }
             //防止丢失mouseup事件
             target.setCapture && this.setCapture();
             return false;
        }

         function stopMove(e){
              init.drag= false;
              //解除capture
              if(target){
                  target.releaseCapture && target.releaseCapture();
              }

         }

         function change(e){
            e = e || window.event;
            init={
               lX: option.single? line.x: leftBtn.offset().left,
               rX: rightBtn.offset().left,
               drag: true,
               move: arguments[1]
            }
            var newPoint = e.clientX;

            function moveWhichContainer(hide){
              if(hide || newPoint > init.rX){

                return currentType = 'right';
              }
              if(newPoint < init.lX){
                return currentType = 'left';
              }
              if(newPoint > init.lX && newPoint < init.rX){

                var mid = (init.lX + init.rX) / 2;
                if (newPoint > mid ){
                  return currentType = 'right';
                }else{
                  return  currentType = 'left';
                }
              }
            }
            var type= moveWhichContainer(option.single);
            startMove(e, type, newPoint);

          }

        function removeLeftBtn(hide){
          if(hide){
              el.find('.left-container').remove();
          }
        }

        function removeText(options){
          var classArray = [];

          if(options[0]){
            el.find('.sign-num, .min-num, .max-num').remove();
            return;
          }
          if(options[1]){
            classArray.push(".min-num");
            classArray.push(".max-num");
          }
          if(options[2]){
            classArray.push('.sign-num');
          }

          var classStr = classArray.join(", ");
          el.find(classStr).remove();
          return ;
        }

        function initPosition(){

            var initLeftPositionPer = (option.from / option.sums * 100 ) + '%';
            var initRightPositinPer = (option.to / option.sums * 100 ) + '%';

            leftContainer.css({"left":  initLeftPositionPer});
            rightContainer.css({"left":  initRightPositinPer});

            sliderBar.css({
              'left': initLeftPositionPer,
              'width': (option.to - option.from) / option.sums * 100 + '%',
            });
        }

     }

 });
