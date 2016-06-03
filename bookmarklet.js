// This code is used to create the tooltip bookmarklet to show the mapping of
// salesforce fields => fields displayed on the listing page
// https://ted.mielczarek.org/code/mozilla/bookmarklet.html

addTooltipsToChildren = function(children) { angular.forEach(children, function(e) {
  el = angular.element(e);
  if (el.data().$binding) bind = el.data().$binding;
  else bind = null;
  if (bind && bind != 'heading') {
    if (/^\s+$/.test(el.text()) || !el.text()) {
      el.text('<No value provided>');
      el.css('display', 'block').removeClass('ng-hide');
    }
    bind = bind.toString();
    bind = bind.split(' | ')[0];
    if (bind.indexOf('listing.') == 0) bind = bind.slice('listing.'.length);
    el.css({'text-decoration': 'underline', 'cursor': 'help', 'color': '#DB790F' });
    el.after('<span class="tooltip tip-left" style="left:0"><span>'+bind+'</span></span>');
    el.bind('click', function(ev) {
      ev.stopPropagation();
      tip = angular.element(ev.target).next();
      if (tip.css('display') != 'block') tip.css({display: 'block'});
      else tip.css({display: 'none'});
    })
  }
  if (el.children()) addTooltipsToChildren(el.children());
}) };
addTooltipsToChildren(angular.element(document).children());
