// bundle: Widgets___GroupImage___83d7e5033a731ddd488895c8358a7de5_m
// files: modules/Widgets/GroupImage.js

// modules/Widgets/GroupImage.js
Roblox.define(
	'Widgets.GroupImage',
	['/ide/jquery-1.7.2.min.js', '/ide/js/json2.min.js'],
	function () {
		function r(n) {
			var t = $(n)
			return {
				imageSize: t.attr('data-image-size') || 'medium',
				noClick: typeof t.attr('data-no-click') != 'undefined',
				groupId: t.attr('data-group-id') || 0
			}
		}
		function n(i, u) {
			for ($.type(i) !== 'array' && (i = [i]); i.length > 0; ) {
				for (var o = i.splice(0, 10), e = [], f = 0; f < o.length; f++) e.push(r(o[f]))
				$.getJSON(
					t.endpoint,
					{ params: JSON.stringify(e) },
					(function (t, i) {
						return function (r) {
							for (var a = [], f, h, s, e = 0; e < r.length; e++)
								if (((f = r[e]), f != null)) {
									var c = t[e],
										o = $(c),
										l = $('<div>').css('position', 'relative')
									o.html(l),
										(o = l),
										i[e].noClick || ((h = $('<a>').attr('href', f.url)), o.append(h), (o = h)),
										(s = $('<img>').attr('title', f.name).attr('alt', f.name).attr('border', 0)),
										s.load(
											(function (n, t) {
												return function () {
													n.width(t.width), n.height(t.height)
												}
											})(l, c, s, f)
										),
										o.append(s),
										s.attr('src', f.thumbnailUrl),
										f.thumbnailFinal || a.push(c)
								}
							;(u = u || 1),
								u < 4 &&
									window.setTimeout(function () {
										n(a, u + 1)
									}, u * 2e3)
						}
					})(o, e)
				)
			}
		}
		function i() {
			n($(t.selector + ':empty').toArray())
		}
		var t = { selector: '.roblox-group-image', endpoint: '/thumbs/groupimage.ashx?jsoncallback=?' }
		return { config: t, load: n, populate: i }
	}
)
