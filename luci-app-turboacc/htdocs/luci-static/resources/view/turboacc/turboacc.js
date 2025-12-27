'use strict';
'require view';
'require ui';
'require uci';
'require rpc';
'require form';

var callTurboaccStatus = rpc.declare({
	object: 'luci.turboacc',
	method: 'get_status',
	expect: { '': {} }
});

return view.extend({
	render: function() {
		var m, s, o;

		m = new form.Map('turboacc', _('Turbo ACC 网络加速'),
			_('Turbo ACC 结合了 Linux 内核原生的流量分流 (Flow Offloading) 和 BBR 拥塞控制技术，提升网络转发效率。'));

		// 实时状态显示
		s = m.section(form.TypedSection, '_status');
		s.anonymous = true;
		s.render = function() {
			return callTurboaccStatus().then(L.bind(function(status) {
				return E('div', { 'class': 'cbi-section' }, [
					E('p', {}, [
						E('span', { 'class': 'label' }, _('当前运行状态：')),
						E('span', { 'style': 'margin-left: 10px' }, [
							status.sw_flow ? E('span', { 'class': 'label success' }, _('软件流量加速 (开启)')) : E('span', { 'class': 'label' }, _('软件流量加速 (关闭)')),
							' ',
							status.bbr ? E('span', { 'class': 'label success' }, _('BBR 拥塞控制 (开启)')) : E('span', { 'class': 'label' }, _('BBR 拥塞控制 (关闭)')),
							' ',
							status.fullcone ? E('span', { 'class': 'label success' }, _('FullCone NAT (开启)')) : E('span', { 'class': 'label' }, _('FullCone NAT (关闭)'))
						])
					]),
					E('p', {}, [
						E('span', { 'class': 'label' }, _('内核版本：')),
						E('strong', {}, status.kernel || _('未知'))
					])
				]);
			}, this));
		};

		// 配置表单
		s = m.section(form.NamedSection, 'config', 'turboacc', _('基本设置'));
		s.addremove = false;

		o = s.option(form.Flag, 'sw_flow', _('开启软件流量分流'),
			_('通过 nftables flow offload 技术，减少 CPU 转发消耗。'));
		o.rmempty = false;

		o = s.option(form.Flag, 'hw_flow', _('开启硬件流量分流'),
			_('需要硬件芯片支持（如 MTK PPE），直接由硬件处理数据包。'));
		o.depends('sw_flow', '1');
		o.default = o.disabled;
		o.rmempty = false;

		o = s.option(form.Flag, 'bbr', _('开启 BBR 拥塞控制'),
			_('Google 开发的 TCP 拥塞控制算法，优化高延迟网络速度。'));
		o.rmempty = false;

		o = s.option(form.Flag, 'fullcone', _('开启全锥形 NAT'),
			_('提升 P2P 和网络游戏连接成功率。'));
		o.rmempty = false;

		return m.render();
	}
});
