# SPDX-License-Identifier: GPL-2.0-only
include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-warpengine
PKG_VERSION:=2025.12.30
PKG_RELEASE:=6

PKG_LICENSE:=GPL-2.0
PKG_MAINTAINER:=Your Name <your.email@example.com>

include $(INCLUDE_DIR)/package.mk

define Package/luci-app-warpengine
  SECTION:=luci
  CATEGORY:=LuCI
  SUBMENU:=3. Applications
  TITLE:=WARP Engine - LuCI (JS-based)
  DEPENDS:=+warpengine +luci-base
  PKGARCH:=all
endef

define Package/luci-app-warpengine/description
  Modern LuCI interface for WARP Engine using JavaScript.
endef

define Package/luci-app-warpengine/postinst
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	[ -f /usr/libexec/rpcd/luci.warpengine ] && chmod 0755 /usr/libexec/rpcd/luci.warpengine
	/etc/init.d/rpcd restart
	rm -rf /tmp/luci-indexcache /tmp/luci-modulecache 2>/dev/null || true
fi
exit 0
endef

define Package/luci-app-warpengine/install
	$(INSTALL_DIR) $(1)/www/luci-static/resources/view/warpengine
	$(INSTALL_DATA) ./htdocs/luci-static/resources/view/warpengine/warpengine.js $(1)/www/luci-static/resources/view/warpengine/

	$(INSTALL_DIR) $(1)/usr/libexec/rpcd
	$(INSTALL_BIN) ./root/usr/libexec/rpcd/luci.warpengine $(1)/usr/libexec/rpcd/

	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-warpengine.json $(1)/usr/share/luci/menu.d/

	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-warpengine.json $(1)/usr/share/rpcd/acl.d/

	$(INSTALL_DIR) $(1)/usr/share/ucitrack
	$(INSTALL_DATA) ./root/usr/share/ucitrack/luci-app-warpengine.json $(1)/usr/share/ucitrack/

	$(INSTALL_DIR) $(1)/www/luci-static/resources/i18n/zh_Hans
	$(INSTALL_DATA) ./po/zh_Hans/warpengine.po $(1)/www/luci-static/resources/i18n/zh_Hans/
endef

define Build/Compile
	# No compilation needed for JS apps
endef

$(eval $(call BuildPackage,luci-app-warpengine))
