# Install details

    apt install -y isc-dhcp-server hostapd
    cp start_mitm.sh /usr/local/bin/
    cp mitmweb.service /etc/systemd/system/
    cp etc-dhcpd.conf /etc/dhcp/dhcpd.conf
    cp etc-hostapd.conf /etc/hostapd/hostapd.conf
    ./iptables.sh
    sudo iptables-save | sudo tee /etc/iptables/rules.v4


# things I've probably forgotten

    # sudo iptables-restore < /etc/iptables/rules.v4
/etc/wpa_supplicant/wpa_supplicant.conf

/etc/hostapd/hostapd.conf /etc/init.d/isc-dhcp-server  
