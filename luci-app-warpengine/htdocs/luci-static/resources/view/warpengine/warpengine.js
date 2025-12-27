'use strict';
'use uci';
'use form';
'use rpc';

var callStatus = L.rpc.declare({
	object: 'luci.warpengine',
	method: 'get_status',
	expect: { '': {} }
});

return L.view.extend({
	render: function() {
		let m, s, o;

		m = new L.form.Map('warpengine', _('WarpEngine Ultra Edition'), 
			_('Full-stack network acceleration solution designed for OpenWrt 24.10.'));

		// --- 实时监控部分 ---
		s = m.section(L.form.TypedSection, '_status', _('Real-time Monitor'));
		s.anonymous = true;
		s.render = function() {
			return L.resolveDefault(callStatus(), {}).then(function(res) {
				return E('div', { 'class': 'cbi-section-node' }, [
					E('div', { 'style': 'padding: 10px;' }, [
						_('Active Flows'), ': ', E('strong', { 'style': 'color:blue' }, [ res.flow_count || 0 ]),
						' | ', _('Hardware PPE Status'), ': ', E('strong', { 'style': 'color:green' }, [ 
							res.hw_status === 'Active' ? _('Detected') : _('Not Detected')
						])
					])
				]);
			});
		};

		// --- 核心设置 ---
		s = m.section(L.form.TypedSection, 'main', _('Core Engine Settings'));
		s.anonymous = true;
		
		o = s.option(L.form.Flag, 'enabled', _('Enable WarpEngine'));
		o.rmempty = false;

		o = s.option(L.form.Flag, 'sw_flow_offload', _('Software Flow Offloading'));
		o.depends('enabled', '1');

		o = s.option(L.form.Flag, 'hw_flow_offload', _('Hardware Flow Offloading'), _('Extreme low CPU usage (requires hardware support)'));
		o.depends('sw_flow_offload', '1');

		o = s.option(L.form.Flag, 'ipv6_offload', _('IPv6 Full-stack Acceleration'));
		o.depends('sw_flow_offload', '1');

		// --- 高级优化 ---
		s = m.section(L.form.TypedSection, 'main', _('Advanced Optimization'));
		s.anonymous = true;
		
		o = s.option(L.form.Flag, 'mss_clamping', _('TCP MSS Clamping'), _('Optimize PPPoE MTU adaptation'));
		o = s.option(L.form.Flag, 'game_process', _('Game Forwarding Priority (CAKE)'), _('Reduce jitter for online gaming'));
		o = s.option(L.form.Flag, 'fullcone_nat', _('FullCone NAT'));
		o = s.option(L.form.Flag, 'bbr', _('TCP BBR Algorithm'));

		// --- DNS 设置 ---
		s = m.section(L.form.TypedSection, 'main', _('Smart DNS Acceleration'));
		s.anonymous = true;
		
		o = s.option(L.form.Flag, 'dns_acc', _('Enable DNS Acceleration'));
		o.rmempty = false;

		o = s.option(L.form.ListValue, 'dns_mode', _('DNS Acceleration Mode'));
		o.depends('dns_acc', '1');
		o.value('static', _('Static'));
		o.value('auto', _('Auto (Benchmarking)'));

		o = s.option(L.form.Value, 'dns_server', _('DNS Server Address'));
		o.depends({ dns_acc: '1', dns_mode: 'static' });
		o.datatype = 'ip4addr';

		return m.render();
	}
});
