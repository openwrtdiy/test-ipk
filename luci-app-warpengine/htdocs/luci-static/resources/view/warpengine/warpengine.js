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
                    return E('strong', { 'style': 'color:' + color }, [ text ]);
                }

                return E('div', { 'class': 'cbi-section-node' }, [
                    E('div', { 'style': 'padding: 15px; line-height: 2.2;' }, [
                        _('Kernel Version'), ': ', E('strong', [ res.kernel || '6.6.119' ]),
                        ' | ', _('Active Flows'), ': ', E('strong', { 'style': 'color:blue' }, [ res.flow_count || 0 ]),
                        E('br'),
                        _('Master Switch'), ': ', renderStatus(res.engine_enabled),
                        ' | ', _('Software Acceleration'), ': ', renderStatus(res.sw_status),
                        ' | ', _('Hardware Acceleration'), ': ', renderStatus(res.hw_status),
                        ' | ', _('Full-stack Acceleration'), ': ', renderStatus(res.v6_status),
                        E('br'),
                        _('FullCone NAT'), ': ', renderStatus(res.fullcone_status),
                        ' | ', _('TCP BBR Algorithm'), ': ', renderStatus(res.bbr_status),
                        ' | ', _('Game Priority (CAKE)'), ': ', renderStatus(res.cake_status),
                        ' | ', _('Smart DNS Acceleration'), ': ', renderStatus(res.dns_acc_status)
                    ])
                ]);
            });
        };

        s = m.section(L.form.TypedSection, 'main', _('Warp Engine Settings'));
        s.anonymous = true;
        o = s.option(L.form.Flag, 'enabled', _('Master Switch'));
        o.rmempty = false;

        // 防火墙节点
        s = m.section(L.form.TypedSection, 'main', _('Firewall Settings'));
        s.anonymous = true;
        o = s.option(L.form.Flag, 'sw_flow_offload', _('Software Flow Offloading'));
        o.depends('enabled', '1');
        o = s.option(L.form.Flag, 'hw_flow_offload', _('Hardware Flow Offloading'));
        o.depends({ enabled: '1', sw_flow_offload: '1' });
        o = s.option(L.form.Flag, 'ipv6_offload', _('IPv6 Full-stack Acceleration'));
        o.depends({ enabled: '1', sw_flow_offload: '1' });

        // 高级节点
        s = m.section(L.form.TypedSection, 'main', _('Advanced Optimization'));
        s.anonymous = true;
        o = s.option(L.form.Flag, 'mss_clamping', _('TCP MSS Clamping'));
        o.depends('enabled', '1');
        o = s.option(L.form.Flag, 'game_process', _('Game Forwarding Priority (CAKE)'));
        o.depends('enabled', '1');
        o = s.option(L.form.Flag, 'fullcone_nat', _('FullCone NAT'));
        o.depends('enabled', '1');
        o = s.option(L.form.Flag, 'bbr', _('TCP BBR Algorithm'));
        o.depends('enabled', '1');

        // DNS 节点
        s = m.section(L.form.TypedSection, 'main', _('Smart DNS Acceleration'));
        s.anonymous = true;
        o = s.option(L.form.Flag, 'dns_acc', _('Enable DNS Acceleration'));
        o.depends('enabled', '1');

        return m.render();
    }
});

