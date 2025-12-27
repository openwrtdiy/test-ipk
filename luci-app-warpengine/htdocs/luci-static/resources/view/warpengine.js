'use strict';
'use uci';
'use form';
'use rpc';

var callStatus = rpc.declare({
	object: 'luci.warpengine',
	method: 'get_status',
	expect: { '': {} }
});

return L.view.extend({
	render: function() {
		let m, s, o;

		// 翻译 ID: WarpEngine Ultra Edition
		m = new form.Map('warpengine', _('WarpEngine Ultra Edition'), 
			_('Full-stack network acceleration solution designed for OpenWrt 24.10.'));

		s = m.section(form.TypedSection, '_status', _('Real-time Monitor'));
		s.anonymous = true;
		s.render = function() {
			return L.resolveDefault(callStatus(), {}).then(function(res) {
				return E('div', { 'class': 'cbi-section-node' }, [
					E('p', {}, [
						_('Active Flows'), ': ', E('strong', { 'style': 'color:blue' }, [ res.flow_count || 0 ]),
						' | ', _('Hardware PPE Status'), ': ', E('strong', { 'style': 'color:green' }, [ 
							res.hw_status == 'Active' ? _('Active') : (res.hw_status == 'Disabled' ? _('Disabled') : _('Inactive'))
						])
					])
				]);
			});
		};

		s = m.section(form.TypedSection, 'main', _('Core Engine Settings'));
		s.anonymous = true;
		o = s.option(form.Flag, 'enabled', _('Enable WarpEngine'));
		
		o = s.option(form.Flag, 'sw_flow_offload', _('Software Flow Offloading'));
		o.depends('enabled', '1');

		o = s.option(form.Flag, 'hw_flow_offload', _('Hardware Flow Offloading'), _('Extreme low CPU usage (requires hardware support)'));
		o.depends('sw_flow_offload', '1');

		o = s.option(form.Flag, 'ipv6_offload', _('IPv6 Full-stack Acceleration'));
		o.depends('sw_flow_offload', '1');

		s = m.section(form.TypedSection, 'main', _('Advanced Optimization'));
		s.anonymous = true;
		o = s.option(form.Flag, 'mss_clamping', _('TCP MSS Clamping'), _('Optimize PPPoE MTU adaptation'));
		o = s.option(form.Flag, 'game_process', _('Game Forwarding Priority (CAKE)'), _('Reduce jitter for online gaming'));
		o = s.option(form.Flag, 'fullcone_nat', _('FullCone NAT'));
		o = s.option(form.Flag, 'bbr', _('TCP BBR Algorithm'));

		s = m.section(form.TypedSection, 'main', _('Smart DNS Acceleration'));
		s.anonymous = true;
		o = s.option(form.ListValue, 'dns_mode', _('DNS Acceleration Mode'));
		o.value('static', _('Static'));
		o.value('auto', _('Auto (Benchmarking)'));
		o = s.option(form.Value, 'dns_server', _('DNS Server Address'));
		o.depends('dns_mode', 'static');
		o.datatype = 'ip4addr';

		return m.render();
	}
});

