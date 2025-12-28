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
s = m.section(L.form.TypedSection, '_status', _('Real-time Monitor'));
s.anonymous = true;
s.render = function() {
return L.resolveDefault(callStatus(), {}).then(function(res) {
function renderStatus(status) {
let text = (status === 'Active') ? _('Enabled') : (status === 'Inactive' ? _('Not Supported') : _('Disabled'));
let color = (status === 'Active') ? 'green' : (status === 'Inactive' ? 'orange' : 'red');
return E('strong', { 'style': 'color:' + color }, text);
}
return E('div', { 'class': 'cbi-section-node' }, [
E('div', { 'style': 'padding: 15px; line-height: 2.2;' }, [
_('Kernel Version'), ': ', E('strong', [ res.kernel || '6.6.119' ]),
' | ', _('Active Flows'), ': ', E('strong', { 'style': 'color:blue' }, [ res.flow_count || 0 ]),
' | ', _('Hardware PPE Status'), ': ', renderStatus(res.hw_status), // 将硬件状态移到此处
E('br'),
_('Master Switch'), ': ', renderStatus(res.engine_enabled),
' | ', _('Software Acceleration'), ': ', renderStatus(res.sw_status),
' | ', _('Full-stack Acceleration'), ': ', renderStatus(res.v6_status),
E('br'),
_('FullCone NAT'), ': ', renderStatus(res.fullcone_status),
' | ', _('TCP BBR Algorithm'), ': ', renderStatus(res.bbr_status),
' | ', _('Game Priority (CAKE)'), ': ', renderStatus(res.cake_status),
' | ', _('Smart DNS Acceleration'), ': ', renderStatus(res.dns_acc_status),
E('br'),
_('Packet Steering'), ': ', renderStatus(res.ps_status),
' | ', _('IRQ Balance'), ': ', renderStatus(res.irqb_status)
])
]);
});
};
// 核心引擎设置 (Core Engine Settings) 改名为 曲速引擎
s = m.section(L.form.TypedSection, 'main', _('WarpEngine 曲速引擎'));
s.anonymous = true;
o = s.option(L.form.Flag, 'enabled', _('总控开关')); // 改名为 总控开关
o.rmempty = false;
// 防火墙节点 (Firewall Settings)
s = m.section(L.form.TypedSection, 'main', _('Firewall Settings'));
s.anonymous = true;
o = s.option(L.form.Flag, 'sw_flow_offload', _('Software Flow Offloading'));
o.description = _('Extreme low CPU usage (requires hardware support)');
o.depends('enabled', '1');
o = s.option(L.form.Flag, 'hw_flow_offload', _('Hardware Flow Offloading'));
o.description = _('Extreme low CPU usage (requires hardware support)');
o.depends({ enabled: '1', sw_flow_offload: '1' });
o = s.option(L.form.Flag, 'ipv6_offload', _('IPv6 Full-stack Acceleration'));
o.depends({ enabled: '1', sw_flow_offload: '1' });
o = s.option(L.form.Flag, 'fullcone_nat', _('FullCone NAT'));
o.description = _('Full-cone NAT (FullCone)');
o.depends('enabled', '1');
o = s.option(L.form.Flag, 'mss_clamping', _('TCP MSS Clamping'));
o.description = _('Optimize PPPoE MTU adaptation');
o.depends('enabled', '1');
o = s.option(L.form.Flag, 'mwan3_compat', _('mwan3 Compatibility Mode'));
o.description = _('Optimize nftables priority for mwan3 policy routing');
o.depends('enabled', '1');
// 高级节点 (Advanced Optimization) 改名为 网络设置
s = m.section(L.form.TypedSection, 'main', _('网络设置'));
s.anonymous = true;
o = s.option(L.form.Flag, 'game_process', _('Game Forwarding Priority (CAKE)'));
o.description = _('Reduce jitter for online gaming');
o.depends('enabled', '1');
o = s.option(L.form.Flag, 'bbr', _('TCP BBR Algorithm'));
o.depends('enabled', '1');
// 新建多核设置栏
s = m.section(L.form.TypedSection, 'main', _('多核设置'));
s.anonymous = true;
// 将 Packet Steering 移到此栏
o = s.option(L.form.Flag, 'packet_steering', _('Packet Steering'));
o.description = _('Optimizes multi-core data packet processing efficiency. Requires a multi-core CPU.');
o.depends('enabled', '1');
// 将 IRQ Balance 移到此栏
o = s.option(L.form.Flag, 'irq_balance', _('IRQ Balance'));
o.description = _('Distributes network interrupt requests (IRQ) evenly across all CPU cores. Requires irqbalance package.');
o.depends('enabled', '1');
// 加速排除列表
s = m.section(L.form.TypedSection, 'main', _('Acceleration Exclusion List'));
s.anonymous = true;
o = s.option(L.form.DynamicList, 'exclude_ip', _('Acceleration Exclusion List'));
o.description = _('Source IPs or ports to exclude from acceleration (e.g., VPN traffic)');
o.depends('enabled', '1');
// DNS 节点 (Smart DNS Acceleration)
s = m.section(L.form.TypedSection, 'main', _('Smart DNS Acceleration'));
s.anonymous = true;
o = s.option(L.form.Flag, 'dns_acc', _('Enable DNS Acceleration'));
o.depends('enabled', '1');
o = s.option(L.form.ListValue, 'dns_mode', _('DNS Acceleration Mode'));
o.value('static', _('Static'));
o.value('auto', _('Auto (Benchmarking)'));
o.depends('dns_acc', '1');
o = s.option(L.form.Value, 'dns_server', _('DNS Server Address'));
o.depends({ enabled: '1', dns_acc: '1', dns_mode: 'static' });
return m.render();
}
});

