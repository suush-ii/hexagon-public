// bundle: Widgets___PlaceImage___aff9d78b82154eb90cb9f3b6f22c65f9_m
// files: modules/Widgets/PlaceImage.js

// modules/Widgets/PlaceImage.js
Roblox.define(
	'Widgets.PlaceImage',
	['/ide/jquery-1.7.2.min.js', '/ide/js/json2.min.js'],
	function () {
		function r(n) {
			var t = $(n)
			return {
				imageSize: t.attr('data-image-size') || 'large',
				noClick: typeof t.attr('data-no-click') != 'undefined',
				noOverlays: typeof t.attr('data-no-overlays') != 'undefined',
				placeId: t.attr('data-place-id') || 0
			}
		}
		function u(n, t) {
			var u, r, i
			t.bcOverlayUrl != null &&
				((u = $('<img>')
					.attr('src', t.bcOverlayUrl)
					.attr('alt', 'Builders Club')
					.css('position', 'absolute')
					.css('left', '0')
					.css('bottom', '0')
					.attr('border', 0)),
				n.after(u)),
				t.personalServerOverlayUrl != null
					? ((r = $('<img>')
							.attr('src', t.personalServerOverlayUrl)
							.attr('alt', 'Personal Server')
							.css('position', 'absolute')
							.css('right', '0')
							.css('bottom', '0')
							.attr('border', 0)),
						n.after(r))
					: t.megaOverlayUrl != null &&
						((i = $('<img>')
							.attr('src', t.megaOverlayUrl)
							.attr('alt', 'Mega Place')
							.css('position', 'absolute')
							.css('right', '0')
							.css('bottom', '0')
							.attr('border', 0)),
						n.after(i))
		}
		function n(i, f) {
			for ($.type(i) !== 'array' && (i = [i]); i.length > 0; ) {
				for (var s = i.splice(0, 10), o = [], e = 0; e < s.length; e++) o.push(r(s[e]))
				$.getJSON(
					t.endpoint,
					{ params: JSON.stringify(o) },
					(function (t, i) {
						return function (r) {
							var v = [],
								o,
								c,
								h
							for (e = 0; e < r.length; e++)
								if (((o = r[e]), o != null)) {
									var l = t[e],
										s = $(l),
										a = $('<div>').css('position', 'relative')
									s.html(a),
										(s = a),
										i[e].noClick || ((c = $('<a>').attr('href', o.url)), s.append(c), (s = c)),
										(h = $('<img>').attr('title', o.name).attr('alt', o.name).attr('border', 0)),
										h.load(
											(function (n, t, i, r) {
												return function () {
													n.width(t.width), n.height(t.height), u(i, r)
												}
											})(a, l, h, o)
										),
										s.append(h),
										h.attr('src', o.thumbnailUrl),
										o.thumbnailFinal || v.push(l)
								}
							;(f = f || 1),
								f < 4 &&
									window.setTimeout(function () {
										n(v, f + 1)
									}, f * 2e3)
						}
					})(s, o)
				)
			}
		}
		function i() {
			n($(t.selector + ':empty').toArray())
		}
		var t = { selector: '.roblox-place-image', endpoint: '/thumbs/placeimage.ashx?jsoncallback=?' }
		return { config: t, load: n, populate: i }
	}
)
