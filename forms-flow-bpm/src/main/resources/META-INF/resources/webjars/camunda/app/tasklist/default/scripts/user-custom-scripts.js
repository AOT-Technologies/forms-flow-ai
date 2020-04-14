if (!$.fn.resizable) {
  $.fn.resizable = function fnResizable(options) {
    var opt = {
      // optional selector for handle that starts dragging
      handleSelector: null,
      // resize the width
      resizeWidth: true,
      // resize the height
      resizeHeight: true,
      // hook into start drag operation (event passed)
      onStartDragging: null,
      // hook into stop drag operation (event passed)
      onStopDragging: null,
      // hook into each drag operation (event passed)
      onDrag: null
    };
    if (typeof options == "object") opt = $.extend(opt, options);

    return this.each(function() {
      var $el = $(this);
      var el = $el.get(0);
      var $handle = $(opt.handleSelector);

      var startWidth, startHeight, startTransition;

      function nf(e) {
        e.stopPropagation();
        e.preventDefault();
      };

      function startDragging(e) {
        startX = e.clientX;
        startY = e.clientY;

        startWidth = parseInt($el.width(), 10);
        startHeight = parseInt($el.height(), 10);

        console.log("start: width: " + startWidth + " x: " + startX);

        opt.dragFunc = doDrag;
        $(document).bind('mousemove.rsz', opt.dragFunc);
        $(document).bind('mouseup.rsz', stopDragging);
        $(document).bind('selectstart.rsz', nf);

        startTransition = $el.css("transition");       
        $el.css("transition", "none");        

        if (opt.onStartDragging) opt.onStartDragging(e);
      }

      function doDrag(e) {
        var newWidth = startWidth + e.clientX - startX;                
        
        console.log("start: width: " + startWidth + " x: " + startX + " newidth: " + newWidth);
        
        if (opt.resizeWidth)
          $el.width(newWidth);

        console.log("after: " + $el.width());
        
        if (opt.resizeHeight) $el.height(startHeight + e.clientY - startY);
        if (opt.onDrag)
          opt.onDrag(e);        
      }

      function stopDragging(e) {
        e.stopPropagation();
        e.preventDefault();

        $(document).unbind('mousemove.rsz', opt.dragFunc);
        $(document).unbind('mouseup.rsz', stopDragging);
        $(document).unbind('selectstart.rsz', nf);

        $el.css("transition", startTransition);
        if (opt.onStopDragging) opt.onStopDragging(e);

        return false;
      }

      // Initialization
      $el.addClass("resizable");
      $handle.bind('mousedown.rsz', startDragging);
    });
  };
}
$(".sidebar-left").resizable({
  handleSelector: ".splitter",
  resizeHeight: false
});
$(document).ready(function() {
	  function initCollapsibleWithjQuery() {
	    var collapsibleButtons$ = $(".headercollapsible");
	    collapsibleButtons$.each(function(index, ele) {
	       var collapsible$ = $(ele),
	           content$ = collapsible$.next();
	       collapsible$.click(function() {
	         collapsible$.toggleClass("active");
	         if (!collapsible$.hasClass("active")) {
	           content$.css("maxHeight", "0px");
	         } else {
	           //content$.css("maxHeight", content$.prop("scrollHeight")+"px");
	           content$.css("maxHeight", "118px");
	         }
	       });
	    });
	  }


	 function initializeCollapsible(collapsibles$) {
	   if (collapsibles$ === null) {
	     var collapsibles$ = $(".headercollapsible");
	   }

	  collapsibles$.each(function(index, ele) {
	       var collapsible$ = $(ele),
	           content$ = collapsible$.next();
	       collapsible$.click(function() {
	         collapsible$.toggleClass("active");
	         if (collapsible$.hasClass("active")) {
	           //content$.css("maxHeight", content$.prop("scrollHeight")+"px");
	           content$.css("maxHeight", "118px");
	         } else {
	           content$.css("maxHeight", "0px");
	         }
	       });
	    });
	 }
	 initCollapsibleWithjQuery();
	});
$(document).ready(function() {
$('textarea').keyup(function() {
   var fieldName = $(this).attr('id');
   var maxlen = $(this).attr('maxlength');
   var characterCount = $(this).val().length,
   current = $('#'+fieldName+'_count');
   current.text(characterCount+'/'+maxlen);
    if($(this).val() && $(this).val().length != 0) {
        $('#'+fieldName+'_err').css("display", "none");
   }
 });
$('input').keyup(function() {
   var fieldName = $(this).attr('id');
   var maxlen = $(this).attr('maxlength');
   var characterCount = $(this).val().length,
   current = $('#'+fieldName+'_count');
   current.text(characterCount+'/'+maxlen);
    if($(this).val() && $(this).val().length != 0) {
     $('#'+fieldName+'_err').css("display", "none");
     if(fieldName == 'citizen_contact' || fieldName == 'citizen_email') {
        document.getElementById('citizen_contact_err').style.display = "none";
        document.getElementById('citizen_email_err').style.display = "none";
     }
   }

 });
 $('input').change(function() {
    var fieldName = $(this).attr('id');
     if($(this).val() && $(this).val().length != 0) {
      $('#'+fieldName+'_err').css("display", "none");
    }
  });
   $("select")
   	   .change(function () {
   	   var fieldName = $(this).attr('id');
   	      if($(this).val() && $(this).val().length != 0) {
   	         $('#'+fieldName+'_err').css("display", "none");
   	       }
   });
   $('input').blur(function() {
      var fieldName = $(this).attr('id');
       if($(this).val() && $(this).val().length != 0) {
        $('#'+fieldName+'_err').css("display", "none");
      }

    });
});

function changeApplicationLabel(data) {
		if (data.indexOf('_issue_resolved_other') > 0) {
			document.evaluate('//*[@class="btn btn-primary ng-binding" and @ng-click="complete()"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText = "Complete";
		} else if (data.indexOf('_issue_not_resolved') > 0) {
			document.evaluate('//*[@class="btn btn-primary ng-binding" and @ng-click="complete()"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText = "Escalate";
		} else if (data.indexOf('_issue_resolved') > 0 && data.indexOf('_issue_resolved_other') < 0) {
			document.evaluate('//*[@class="btn btn-primary ng-binding" and @ng-click="complete()"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.innerText = "Complete";
		}
}
function showConfirmation() {
    $('.cd-popup').addClass('is-visible');
  }

$(document).ready(function() {
  confirmCheck = null;
});

$(document).keyup(function(event){
    	if(event.which=='27'){
    		$('.cd-popup').removeClass('is-visible');
	    }
    });

$('.cd-popup').on('click', function(event){
		if( $(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup') ) {
			event.preventDefault();
			$(this).removeClass('is-visible');
		}
});
$('.small.information.icon')
  .popup({
    hoverable: true,
    position : 'right center',
  });

function handleMultiselectValue(id) {
  	document.getElementById(id+'_tmp').value= $('#'+id).dropdown('get value');
}