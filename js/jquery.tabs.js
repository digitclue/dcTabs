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
;(function(){
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
			this.findElements();
			this.attachEvents();

			this.makeCallback('onInit', this);
		},
		findElements: function(){
			var self = this;
			this.tabset = $(this.options.tabset);
			this.tabLinks = this.tabset.find(this.options.tabLinks);
			this.parents = this.tabLinks.parent();
			this.tabs = $();
			this.busy = false;
			this.fakeTimer;

			this.tabLinks.each(function(){
				var link = $(this);
				var href = link.attr(self.options.attrib);
				href = href.substr(href.lastIndexOf('#'));
				var tab = $(href);

				if (tab.length){
					self.tabs = self.tabs.add(tab);
					// find tab holder
					if(!self.tabHolder) {
						self.tabHolder = tab.parent();
					}

					// show only active tab
					var classOwner = self.options.addToParent ? link.parent() : link;
					if(classOwner.hasClass(self.options.activeClass) || (self.options.checkHash && location.hash === href)) {
						classOwner.addClass(self.options.activeClass);
						tab.removeClass(self.options.hiddenClass).width('');

						self.tabsEffect[self.options.effect].switchState({
							state:true,
							tab:tab,
							initial:true
						});
					} else {
						var tabWidth = tab.width();
						tab.width(tabWidth);
						tab.addClass(self.options.hiddenClass);
					}

					link.data({
						ctab:tab
					});
				} else {
					self.tabLinks = self.tabLinks.not(link);
				}
			});
		},
		attachEvents: function(){
			var self = this;

			this.eventHandler = function(e){
				e.preventDefault();
				var link = $(this);
				if (self.busy) return;
				var classOwner = self.options.addToParent ? link.parent() : link;

				if (classOwner.hasClass(self.options.activeClass)){
					if (self.options.collapsible){
						self.closeTab();
					}
				} else {
					self.openTab(link);
				}
			}
			this.resizeHandler = function(){
				if (self.busy) return;
				if (self.fakeTimer) clearTimeout(self.fakeTimer);
				self.fakeTimer = setTimeout(function(){
					self.tabHolder.css({position:'relative'});
					var hiddenTabs = self.tabs.filter('.' + self.options.hiddenClass);
					hiddenTabs.each(function(){
						var tab = $(this).removeClass(self.options.hiddenClass).css({width:''});
						self.tabsEffect[self.options.effect].destroy(tab);
						var tabWidth = tab.width();
						tab.width(tabWidth).addClass(self.options.hiddenClass);
					});
					self.tabHolder.css({position:''});
				}, 100);
			}
			$(window).on('resize orientationchange load', this.resizeHandler);
			this.tabLinks.on(this.options.event, this.eventHandler);
		},
		openTab: function(link){
			var self = this;
			this.busy = true;
			this.closeTab(function(){
				if (link && link.length){
					self.makeCallback('animStart', true, link);
					var tab = link.data('ctab');
					tab.css({width:''}).removeClass(self.options.hiddenClass);
					self.refreshState(link);
					self.tabsEffect[self.options.effect].switchState({
						state:true,
						tab:tab,
						complete: function(){
							self.makeCallback('animEnd', true, link);
							self.busy = false;
						}
					});
				} else {
					self.busy = false;
				}
			});
		},
		closeTab: function(callback){
			var self = this;
			this.busy = true;
			if (this.options.addToParent){
				var activeLink = this.parents.filter('.' + this.options.activeClass).find(this.options.tabLinks);
			} else {
				var activeLink = this.tabLinks.filter('.' + this.options.activeClass);
			}
			var openedTab = activeLink.data('ctab');
			if (openedTab && openedTab.length){
				self.makeCallback('animStart', false, activeLink);
				this.tabsEffect[this.options.effect].switchState({
					state:false,
					tab:openedTab,
					complete: function(){
						var tabWidth = openedTab.width();
						openedTab.width(tabWidth);
						openedTab.addClass(self.options.hiddenClass);

						self.makeCallback('animEnd', false, activeLink);
						self.busy = false;
						self.refreshState();
						if (typeof callback === 'function'){
							callback();
						}
					}
				});
			} else {
				this.busy = false;
				if (typeof callback === 'function'){
					callback();
				}
			}
		},
		refreshState: function(link){
			(this.options.addToParent ? this.parents : this.tabLinks).removeClass(this.options.activeClass);
			if (link && link.length){
				if (this.options.addToParent){
					link.parent().addClass(this.options.activeClass);
				} else {
					link.addClass(this.options.activeClass);
				}
			}
		},
		makeCallback: function(name){
			if (typeof this.options[name] === 'function'){
				var args = Array.prototype.slice.call(arguments);
				args.shift();
				this.options[name].apply(this, args);
			}
		},
		destroy: function(){
			this.busy = true;
			if (this.fakeTimer) clearTimeout(this.fakeTimer);
			$(window).off('resize orientationchange', this.resizeHandler);
			this.tabLinks.off(this.options.event, this.eventHandler);
			(this.options.addToParent ? this.parents : this.tabLinks).removeClass(this.options.activeClass);
			this.tabs.css({width:''}).removeClass(this.options.hiddenClass);
			if (this.tabsEffect[this.options.effect].destroy){
				this.tabsEffect[this.options.effect].destroy(this.tabs);
			}
			this.tabLinks.removeData('ctab');
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
	}
	$.fn.contentTabs = function(options){
		return this.each(function(){
			$(this).data('ContentTabs', new ContentTabs($.extend({tabset:this}, options)));
		});
	}
})(jQuery);