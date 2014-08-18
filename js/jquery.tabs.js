// page init
jQuery(function(){
	initTabs();
});

// content tabs init
function initTabs() {
	jQuery('ul.fade-tabset').contentTabs({
		autoHeight: true,
		animSpeed: 300,
		collapsible:true,
		effect: 'fade',
		tabLinks: 'a'
	});
	jQuery('ul.slide-tabset').contentTabs({
		addToParent: true,
		animSpeed: 500,
		collapsible:true,
		effect: 'slide',
		tabLinks: 'a'
	});
}

/*
 * jQuery Tabs plugin
 */
;(function($, window){
	function ContentTabs(options){
		this.options = $.extend({
			activeClass:'active',
			addToParent:false,
			checkHash:false,
			animSpeed:400,
			collapsible:false,
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
			var tabStyleRule = '.'+this.options.hiddenClass;
			this.tabStyleSheet = $('<style type="text/css">')[0];

			tabStyleRule += '{position:absolute !important;left:-9999px !important;top:-9999px !important;display:block !important}';
			if (this.tabStyleSheet.styleSheet) {
				this.tabStyleSheet.styleSheet.cssText = tabStyleRule;
			} else {
				this.tabStyleSheet.appendChild(document.createTextNode(tabStyleRule));
			}
			$('head').append(this.tabStyleSheet);
			
			this.findElements();
			this.attachEvents();

			this.makeCallback('onInit', this);
		},
		findElements: function(){
			var self = this;
			this.tabset = $(this.options.tabset);
			this.tabLinks = this.tabset.find(this.options.tabLinks);
			
			this.tabs = $();
			this.busy = false;
			this.timer = null;

			this.tabLinks.each(function(){
				var link = $(this),
					href = link.attr(self.options.attrib),
					tab,
					classOwner,
					tabWidth,
					parent;

				href = href.substr(href.lastIndexOf('#'));
				tab = $(href);

				if (tab.length){
					self.tabs = self.tabs.add(tab);
					parent = link.parent();
					// find tab holder
					if(!self.tabHolder) {
						self.tabHolder = tab.parent();
					}

					// show only active tab
					classOwner = self.options.addToParent ? parent : link;
					if (classOwner.hasClass(self.options.activeClass) || (self.options.checkHash && location.hash === href)) {
						classOwner.addClass(self.options.activeClass);
						tab.removeClass(self.options.hiddenClass).width('');

						self.tabsEffect[self.options.effect].switchState({
							state:true,
							tab:tab,
							initial:true
						});
					} else {
						tabWidth = tab.width();
						tab.width(tabWidth);
						tab.addClass(self.options.hiddenClass);
					}

					link.data({
						ctab:tab,
						cparent: parent
					});
				} else {
					self.tabLinks = self.tabLinks.not(link);
				}
			});

			this.parents = this.tabLinks.parent();
		},
		attachEvents: function(){
			var self = this;

			this.eventHandler = function(e){
				var link = $(this),
					classOwner = self.options.addToParent ? link.data('cparent') : link;

				e.preventDefault();

				if (classOwner.hasClass(self.options.activeClass)){
					if (self.options.collapsible){
						self.closeTab();
					}
				} else {
					self.openTab(link);
				}
			};
			this.resizeHandler = function(){
				if (!self.busy){
					if (self.timer) clearTimeout(self.timer);
					self.timer = setTimeout(function(){
						self.tabHolder.css({position:'relative'});

						self.tabs.filter('.' + self.options.hiddenClass).each(function(){
							var tab = $(this),
								tabWidth;
							tab.removeClass(self.options.hiddenClass).css({width:''});
							if (self.tabsEffect[self.options.effect].destroy){
								self.tabsEffect[self.options.effect].destroy(tab);
							}
							tabWidth = tab.width();
							tab.width(tabWidth).addClass(self.options.hiddenClass);
						});

						self.tabHolder.css({position:''});
					}, 100);
				}
			};

			$(window).on('resize orientationchange load', this.resizeHandler);
			this.tabLinks.on(this.options.event, this.eventHandler);
		},
		openTab: function(link){
			var self = this;

			if (link && link.length){
				this.closeTab(function(){
					var tab = link.data('ctab');

					self.makeCallback('animStart', true, link);

					tab.css({width:''}).removeClass(self.options.hiddenClass);
					self.refreshState(link);
					self.tabsEffect[self.options.effect].switchState({
						state:true,
						tab:tab,
						complete: function(){
							self.makeCallback('animEnd', true, link);
						}
					});
				});
			}
		},
		closeTab: function(callback){
			var self = this,
				activeLink,
				openedTab,
				tabWidth;

			if (this.options.addToParent){
				activeLink = this.parents.filter('.' + this.options.activeClass).find(this.options.tabLinks);
			} else {
				activeLink = this.tabLinks.filter('.' + this.options.activeClass);
			}

			openedTab = activeLink.data('ctab');

			if (openedTab && openedTab.length){
				self.makeCallback('animStart', false, activeLink);
				
				tabWidth = openedTab.width();

				this.tabsEffect[this.options.effect].switchState({
					state:false,
					tab:openedTab,
					complete: function(){
						openedTab.width(tabWidth);
						openedTab.addClass(self.options.hiddenClass);

						self.makeCallback('animEnd', false, activeLink);

						self.refreshState();

						if (typeof callback === 'function'){
							callback();
						}
					}
				});
			} else {
				if (typeof callback === 'function'){
					callback();
				}
			}
		},
		refreshState: function(link){
			var classOwner;

			(this.options.addToParent ? this.parents : this.tabLinks).removeClass(this.options.activeClass);

			if (link && link.length){
				classOwner = this.options.addToParent ? link.data('cparent') : link;
				classOwner.addClass(this.options.activeClass);
			}
		},
		makeCallback: function(name){
			if (typeof this.options[name] === 'function'){
				var args = Array.prototype.slice.call(arguments, 1);
				this.options[name].apply(this, args);
			}
		},
		destroy: function(){
			this.busy = true;
			if (this.timer) clearTimeout(this.timer);
			$(window).off('resize orientationchange', this.resizeHandler);
			this.tabLinks.off(this.options.event, this.eventHandler);
			(this.options.addToParent ? this.parents : this.tabLinks).removeClass(this.options.activeClass);
			this.tabs.css({width:''}).removeClass(this.options.hiddenClass);
			if (this.tabsEffect[this.options.effect].destroy){
				this.tabsEffect[this.options.effect].destroy(this.tabs);
			}
			this.tabStyleSheet.remove();
			this.tabLinks.removeData('ctab cparent');
			this.tabset.removeData('ContentTabs');
		},
		tabsEffect: {
			none: {
				switchState: function(options) {
					if (typeof options.complete === 'function'){
						options.complete.call(options.tab);
					}
				}
			},
			fade: {
				switchState: function(options){
					if (options.initial) options.animSpeed = 0;
					options.tab.css({
						opacity:(options.state) ? 0 : 1
					});
					options.tab.stop(true, true).animate({
						opacity: (options.state) ? 1 : 0
					}, {
						duration: options.animSpeed,
						complete: function(){
							if (typeof options.complete === 'function'){
								options.complete.call(this);
							}
						}
					});
				},
				destroy: function(tabs){
					tabs.css({opacity:''});
				}
			},
			slide: {
				switchState: function(options){
					if (options.initial) options.animSpeed = 0;
					var tabHeight = options.tab.height();
					options.tab.css({
						height:(options.state) ? 0 : tabHeight
					});
					options.tab.stop(true, true).animate({
						height: (options.state) ? tabHeight : 0
					}, {
						duration: options.animSpeed,
						complete: function(){
							options.tab.css({
								height:''
							});
							if (typeof options.complete === 'function'){
								options.complete.call(this);
							}
						}
					});
				},
				destroy: function(tabs){
					tabs.css({height:''});
				}
			}
		}
	};
	$.fn.contentTabs = function(options){
		return this.each(function(){
			var elem = jQuery(this);
			if (!elem.data('ContentTabs')){
				$(this).data('ContentTabs', new ContentTabs($.extend({tabset:this}, options)));
			}
		});
	};
})(jQuery, window);