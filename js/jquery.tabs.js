// page init
jQuery(function(){
	initTabs();
});

// content tabs init
function initTabs() {
	jQuery('ul.fade-tabset').contentTabs({
		autoHeight: true,
		animSpeed: 300,
		effect: 'fade',
		tabLinks: 'a'
	});
	jQuery('ul.slide-tabset').contentTabs({
		addToParent: true,
		animSpeed: 500,
		effect: 'slide',
		tabLinks: 'a'
	});
}

/*
 * jQuery Tabs plugin
 */
;(function(){
	function ContentTabs(options){
		this.options = $.extend({
			activeClass:'active',
			addToParent:false,
			autoHeight:false,
			autoRotate:false,
			checkHash:false,
			animSpeed:400,
			switchTime:3000,
			effect: 'none', // "fade", "slide"
			tabLinks:'a',
			hiddenClass:'js-hidden',
			attrib:'href',
			event:'click'
		}, options);
		this.init();
	}
	ContentTabs.prototype = {
		init: function(){
			this.findElements();
			this.attachEvents();

			this.makeCallback('onInit', this);
		},
		findElements: function(){
			var self = this;
			this.tabset = $(this.options.tabset);
			this.tabLinks = this.tabset.find(this.options.tabLinks);
			this.parents = this.tabLinks.parent();

			this.tabLinks.each(function(){
				var link = $(this);
				var parent = link.parent();
				var href = link.attr(self.options.attrib);
				href = href.substr(href.lastIndexOf('#'));
				var tab = $(href);

				// find tab holder
				if(!self.tabHolder && tab.length) {
					self.tabHolder = tab.parent();
				}

				// show only active tab
				var classOwner = self.options.addToParent ? parent : link;
				if(classOwner.hasClass(self.options.activeClass) || (self.options.checkHash && location.hash === href)) {
					classOwner.addClass(self.options.activeClass);
					tab.removeClass(self.options.hiddenClass).width('');
					self.tabsEffect[self.options.effect].show({tab:tab, fast:true});
				} else {
					var tabWidth = tab.width();
					tab.width(tabWidth);
					tab.addClass(self.options.hiddenClass);
				}

				link.data({
					cparent:parent,
					ctab:tab
				});
			});
		},
		attachEvents: function(){
			var self = this;

			this.eventHandler = function(e){
				e.preventDefault();
				var link = $(this);
				console.log('event');
			}
			this.tabLinks.on(this.options.event, eventHandler);
		},
		makeCallback: function(name){
			if (typeof this.options[name] === 'function'){
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		},
		destroy: function(){

		},
		tabsEffect:{
			none:{
				show:function(){

				},
				hide:function(){

				}
			},
			fade:{
				show:function(){

				},
				hide:function(){
					
				}
			},
			slide:{
				show:function(){

				},
				hide:function(){
					
				}
			}
		}
	}
	$.fn.contentTabs = function(options){
		return this.each(function(){
			$(this).data('ContentTabs', new ContentTabs($.extend({tabset:this}, options)));
		});
	}
})(jQuery);