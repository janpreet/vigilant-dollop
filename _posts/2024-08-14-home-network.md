---
layout: post
title:  "Home Network Journey"
date:   2024-08-14 20:15:29 -0500
categories: tech
comments: false
permalink: /home-network
---

For quite some time, I've been wanting to write about my home networking journey. The complexities, challenges, and triumphs of building a sophisticated home network have been a significant part of my life, and I've often thought about sharing these experiences with others. However, it wasn't until recently that I felt truly ready to put my thoughts into words.

What finally motivated me to do this write-up was a growing sense of positivity about sharing my experiences through my blog posts. I realized that my journey - from a simple mesh system to a complex, multi-VLAN setup - could provide valuable insights to others who are interested in home networking. Whether you're just starting to explore beyond basic routers or you're a seasoned networking enthusiast, I hope my experiences can offer some useful perspectives.

## The OSI Model: A Foundation for Understanding

Before diving into my journey, it's crucial to understand the OSI (Open Systems Interconnection) model, which provides a framework for how different networking technologies interact:

1. Physical Layer (Layer 1): This is where technologies like MoCA operate, dealing with the physical transmission of data.
2. Data Link Layer (Layer 2): VLANs function at this layer, managing how data is formatted for transmission. Most managed switches, including those I use in my setup, primarily operate at this layer, handling tasks like VLAN tagging and frame forwarding.
3. Network Layer (Layer 3): IP routing occurs here, determining how data is sent between different networks. While my router (Firewalla) primarily operates at this layer, some advanced managed switches (often called "Layer 3 switches") can also perform basic routing functions at this layer.
4. Transport Layer (Layer 4): This is where more advanced features like Firewalla's application identification operate. It's also where DNS queries and responses are encapsulated in UDP or TCP packets.
5. Session Layer (Layer 5) and Presentation Layer (Layer 6): While not as directly relevant to our home networking setup, these layers handle things like session establishment and data formatting.
6. Application Layer (Layer 7): This is where NextDNS primarily operates, providing DNS resolution, content filtering, and security features. Many of the services and applications we use in our daily internet interactions function at this layer.

Understanding this model has been crucial in my networking journey, helping me troubleshoot issues and design a more effective network. It's particularly important when configuring managed switches and understanding how they interact with other devices in the network.

## The Mesh Networking Revolution (2021)

My journey began in 2021 with an Orbi mesh system, riding the wave of the mesh networking revolution. Mesh networks had gained significant popularity due to their ability to eliminate Wi-Fi dead zones and provide seamless coverage throughout homes.

### Why Mesh?

Mesh networks represented a significant leap forward from traditional router-extender setups. They offer several advantages:

1. Seamless Roaming: Devices can move between nodes without disconnecting.
2. Self-Healing: If one node fails, the network can reroute through other nodes.
3. Easy Expansion: Adding new nodes is typically plug-and-play.

The Orbi system, like many of its competitors (such as Eero, Google Wifi, and Netgear Nighthawk), promised to deliver these benefits. However, as I would soon discover, mesh systems also have limitations, particularly in homes with complex layouts or demanding usage patterns.

## The MoCA Breakthrough (2022)

In 2022, I discovered MoCA (Multimedia over Coax Alliance) technology, which would prove to be a game-changer for my network setup.

### Understanding MoCA

MoCA adapters use the existing coaxial cable infrastructure in homes to create a high-speed, wired data network. This technology offers several significant advantages:

1. High Speeds: MoCA 2.5 can provide throughput up to 2.5 Gbps.
2. Low Latency: Typically under 3-4 ms, crucial for gaming and video conferencing.
3. Reliability: Not subject to wireless interference like Wi-Fi.

### Implementing MoCA Securely

As I delved deeper into MoCA implementation, I learned about several important security measures:

1. Point of Entry (PoE) Filter: I learned about the importance of using a PoE filter, particularly crucial because I had cable internet at the beginning of my MoCA journey. Here's what I discovered:
   - Function: A PoE filter is essentially a unidirectional diode for MoCA signals.
   - Installation: It should be installed upstream from the source splitter, typically where the cable line enters your home.
   - Purpose: The primary purpose is to prevent your intra-house MoCA signals from leaking out to the external cable network.
   - Security: By containing your MoCA signals within your home, you're enhancing the security of your network and preventing potential interference with neighboring MoCA networks.
   - Signal Boost: An additional benefit is that the PoE filter reflects the MoCA signals back into your home network, potentially boosting signal strength.

2. Password Protection: In addition to the PoE filter, I implemented password protection on my MoCA adapters. This adds an extra layer of security by:
   - Preventing unauthorized devices from joining the MoCA network
   - Encrypting the data transmitted over the coaxial lines
   - Ensuring that even if someone were to bypass the PoE filter, they couldn't access or interfere with my MoCA network without the password

Understanding and implementing these security measures was a crucial step in ensuring that my MoCA network was not only high-performing but also secure and non-disruptive to the broader cable network.

By using MoCA adapters to create a hardwired backhaul for my Orbi satellites, I was able to significantly improve the performance of my mesh system. This hybrid approach - wireless mesh frontend with wired backhaul - represents an optimal solution for many homes, combining the convenience of Wi-Fi with the reliability of a wired connection.

## Embracing Advanced Routing and Security (Late 2022)

As my network grew more complex, I transitioned to using a Firewalla device, placing my Orbi system into bridge mode. This move was driven by a desire for more granular control over my network and enhanced security features.

### Firewalla and Network Security

Firewalla devices represent a class of prosumer network security appliances that bring enterprise-grade features to home networks. Key features include:

1. Intrusion Detection and Prevention (IDS/IPS)
2. Ad blocking and malware protection
3. VPN server and client capabilities
4. Detailed network analytics and device fingerprinting

By adopting Firewalla, I was able to gain deeper insights into my network traffic and implement more sophisticated security policies.

## The VLAN Revolution

With Firewalla acting as my primary router, I delved into the world of VLANs (Virtual Local Area Networks). VLANs allow for logical segmentation of a physical network, offering several benefits:

1. Improved Security: Isolate potentially vulnerable IoT devices from critical systems.
2. Better Performance: Reduce broadcast domain sizes and optimize traffic flow.
3. Simplified Management: Group devices logically for easier administration.

I invested in managed switches and Meraki Go APs to fully leverage VLAN capabilities. This allowed me to create separate networks for different purposes, significantly enhancing both the security and functionality of my home network.

### VLAN ID Naming Convention

To maintain consistency and ease of management, I adopted a systematic approach to naming my VLAN IDs. I chose to align the VLAN ID with the third octet of the subnet's IP address. For example:

- If the subnet is 10.10.34.0/24, the corresponding VLAN ID would be 34.
- For a subnet of 192.168.50.0/24, the VLAN ID would be 50.

This convention provides a clear, logical relationship between the VLAN ID and its associated subnet, making it easier to identify and manage different network segments.

### The VLAN Learning Curve

Implementing VLANs was not without its challenges. The concept of logically separating a physical network took some time to grasp fully. I spent countless hours researching, configuring, and sometimes troubleshooting issues like devices not communicating across VLANs when they should, or conversely, accessing resources they shouldn't.

One of the most interesting aspects of my VLAN journey was learning about the different terminologies used by various vendors for the same concepts. For instance, I discovered that what Cisco calls a "default VLAN" is referred to as a "PVID" (Port VLAN ID) by other manufacturers. This diversity in terminology initially caused some confusion but ultimately broadened my understanding of networking concepts across different platforms.

I also delved deep into understanding the intricacies of trunk ports and the difference between tagged and untagged traffic:

- Trunk Ports: These are ports that carry traffic for multiple VLANs. I learned that trunk ports should only be used when connecting to another VLAN-aware device, such as another managed switch or a router.

- Tagged vs. Untagged Traffic: Untagged traffic enters a switch port without a VLAN tag, and the switch assigns it to a specific VLAN (often the PVID of the port). Tagged traffic already has a VLAN ID assigned. I discovered that configuring these correctly is crucial for proper VLAN operation.

Through my research and experimentation, I also picked up some best practices:

1. Avoid using default VLANs when possible. This adds an extra layer of security by ensuring that all traffic is intentionally assigned to a specific VLAN.

2. For ports connected to a single device (like a computer or IoT device), configure them as access ports. This means they're assigned to only one VLAN. The traffic enters the port untagged, but the switch tags it with the appropriate VLAN ID when sending it upstream.

3. Only configure trunk ports when connecting to another VLAN-aware device that can handle tagged traffic.

My setup includes a mix of TP-Link and Netgear smart switches, which are working seamlessly with UniFi APs and my Firewalla router + MoCA. This combination has proven to be both cost-effective and highly functional, demonstrating that you don't need a single-vendor solution to create a robust, VLAN-capable network.

The effort invested in understanding and implementing VLANs was absolutely worth it. The resulting network segmentation has dramatically improved my network's security, performance, and manageability. It's given me the ability to isolate potentially vulnerable devices, optimize traffic flow, and maintain granular control over my home network.

For anyone embarking on their own VLAN journey, I'd encourage patience and persistence. The learning curve can be steep, but the benefits in terms of network control and security are immense. Don't be afraid to mix and match equipment from different vendors - with proper configuration, you can create a powerful and flexible network setup tailored to your specific needs.

## Advanced VLAN Usage and Network Segmentation

My exploration of VLANs went beyond basic network segmentation. One particularly useful application was the ability to create distinct trusted and untrusted networks, as well as "airgap" certain noisy or potentially insecure devices. Here's how I leveraged this:

1. Trusted Network: This VLAN includes personal devices, work equipment, and other devices that require full access to home network resources. It has the highest level of security and unrestricted internal access.

2. Untrusted Network: This VLAN is for devices that need internet access but shouldn't have access to the rest of the network. This includes guest devices, IoT gadgets with questionable security practices, and any device with frequent, unnecessary network chatter.

3. IoT Quarantine: Some smart home devices are isolated on their own VLAN. This prevents them from accessing other parts of my network while still allowing them to function and be controlled as needed.

4. Media Streaming Optimization: Devices like smart TVs and streaming boxes are on their own VLAN, allowing me to prioritize their traffic without affecting other network activities.

By strategically using VLANs, I've not only enhanced my network's security but also gained fine-grained control over how different devices interact and how network resources are allocated. This segmentation provides an additional layer of protection against potential security breaches and allows for more efficient network management.

## The Fiber Optic Upgrade and Failover Strategies (2023)

2023 brought fiber internet to my doorstep, promising gigabit speeds and lower latency. However, the transition wasn't as straightforward as simply swapping out my modem.

### CGNAT and Its Implications

Many fiber providers use Carrier-Grade NAT (CGNAT) to conserve IPv4 addresses. While this doesn't affect most users, it can create challenges for those running servers or requiring port forwarding. Understanding and working around CGNAT limitations became an important part of my networking education.

### CGNAT Workarounds

To get around challenges for remote access with CGNAT, I was offered two main solutions:

1. Static IP: My ISP offered a static IP for a fixed monthly fee, which would have bypassed CGNAT issues entirely.
2. IPv6 + VPN: I opted for this more cost-effective solution. By leveraging IPv6 and setting up a VPN server on my Firewalla, I can securely access my home network when I'm away.

This setup allows me to maintain access to my home devices and services without incurring additional monthly costs, while also adding an extra layer of security to my remote connections.

#### Tailscale: A Game-Changer for Remote Access

In addition to the IPv6 + Firewalla VPN server, I've implemented Tailscale as my primary VPN solution. Tailscale runs on my Synology NAS, providing a seamless and secure way to access my home network from anywhere. This setup offers several advantages:

1. Easy Setup: Tailscale's configuration is straightforward compared to traditional VPNs.
2. Enhanced Security: Tailscale uses WireGuard protocol, known for its robust security and performance.
3. NAT Traversal: It works well even behind CGNAT, solving many remote access issues.

However, implementing Tailscale wasn't without its challenges. I discovered that the encryption and decryption processes required by Tailscale can be quite resource-intensive. This led me to max out the RAM on my Synology NAS to ensure smooth performance, especially when streaming local media while away from home.

During my troubleshooting of slow Tailscale speeds on non-home networks, I came across this thread ["Firewalla Tailscale Performance Bottleneck"](https://help.firewalla.com/hc/en-us/community/posts/25365367131539/comments/25366143921299), which shed light on the relationship between Tailscale's performance, Firewalla, and Tailscale exit node. This knowledge was crucial in optimizing my setup and understanding the importance of adequate hardware resources in maintaining a high-performance home network, even when accessing it remotely.

### Implementing a Robust Failover System

Initially, I kept both my cable and fiber connections, using them in a failover configuration. This dual-WAN setup provided redundancy, ensuring I'd stay connected even if one ISP experienced issues.

Eventually, I optimized my setup further:

1. Primary Connection: Fiber internet
2. Secondary Failover: Firewalla's Wi-Fi SD as a receiver for my phone's 5G hotspot

This configuration leverages the high speed of fiber while using the ubiquity of cellular networks as a backup. It's a testament to how home networks can now rival business setups in terms of reliability and redundancy.

## Traffic Shaping with CAKE and Smart Queues

For media streaming and overall network performance, I've implemented CAKE (Common Applications Kept Enhanced) and Smart Queues. These advanced Quality of Service (QoS) mechanisms help ensure that my network remains responsive even under heavy load:

- CAKE: This modern queuing discipline provides a sophisticated approach to traffic shaping. It helps reduce bufferbloat, ensures fair bandwidth allocation, and can significantly improve the responsiveness of your network, especially when it's approaching capacity.

- Smart Queues: This feature, available on my Firewalla, works in conjunction with CAKE to prioritize different types of traffic. It ensures that time-sensitive applications (like video calls or online gaming) get priority over less time-sensitive traffic (like large downloads).

By implementing these technologies, I've been able to maintain excellent streaming quality and low latency for gaming and video calls, even when the network is under heavy use.

### The Challenge of Advanced QoS

Setting up CAKE and Smart Queues was one of the more challenging aspects of my network optimization. It required a deep dive into understanding traffic patterns, application requirements, and the intricacies of network congestion. The learning curve was steep, involving lots of trial and error, but the results in terms of improved network responsiveness have been remarkable.

## Secure DNS and Privacy

In 2023, I implemented NextDNS across my network, a cloud-based DNS resolution service that offers security and privacy features NextDNS primarily operates at Layer 7 (Application Layer) of the OSI model, interacting with lower layers to provide its services.

### Benefits of NextDNS

1. Ad blocking at the DNS level
2. Protection against phishing and malware domains
3. Custom filtering rules and whitelists
4. Detailed analytics on network queries

By operating at the Application Layer, NextDNS can provide these advanced features while seamlessly integrating with the lower layers of the network stack. This allows for sophisticated DNS handling without requiring changes to the underlying network infrastructure.

I even created profiles for our mobile devices using Apple Configurator, ensuring they use DNS-over-HTTPS (DoH) for secure resolution regardless of the network they're connected to (even cellular).

While I considered running my own recursive DNS server using Unbound, the convenience and features of NextDNS have so far outweighed the potential privacy benefits of a self-hosted solution.

## The UniFi Transition (2024)

When Meraki announced the end-of-life for their Go product line, I saw an opportunity to explore the UniFi ecosystem, known for its scalability and comprehensive management interface.

### Meraki Go vs. UniFi

It's important to clarify why I initially chose Meraki Go and why I transitioned to UniFi:

- Meraki Go: Unlike its enterprise counterpart, Meraki Go doesn't require licensing fees. This was a key factor in my initial decision, as it offered advanced features without ongoing costs.
- UniFi: Also doesn't require licensing fees, offers a broader ecosystem, and provides more granular control over network settings.

The transition from Meraki Go to UniFi was driven by the end-of-life announcement rather than cost considerations. Both systems cater to the prosumer/small business market but with different approaches:

- Meraki Go: Cloud-managed, simple to set up, designed for ease of use.
- UniFi: More complex initial setup, but offers greater customization and a much broader product ecosystem.

My switch to UniFi APs, along with adding a CloudKey+ for managing hardwired UniFi cameras, has given me a taste of a more integrated, expandable system. The UniFi Controller software provides a single pane of glass for network management, from APs to switches to cameras.

### The Cloud Provider Analogy

As a light-hearted comparison, I've come to think of the difference between UniFi and Meraki Go as similar to the difference between AWS and Azure in the cloud computing world. (No offense intended to either networking or cloud platform!)

- UniFi is like AWS: A vast ecosystem of products and services spread across a complex dashboard. It offers incredibly fine-grained controls and powerful features, but there's definitely a learning curve. You might find yourself clicking through multiple menus to find that one specific setting you need.

- Meraki Go is more like Azure or GCP: More streamlined and user-friendly, with a focus on getting things done quickly and easily. The features you need are often right where you expect them to be, but you might not have quite the same level of granular control.

Just as cloud architects might debate the merits of AWS vs. Azure vs GCP, networking enthusiasts could spend hours discussing UniFi vs. Meraki Go vs Aruba InstantOn. In the end, all are excellent systems - it just depends on your specific needs and how much time you want to invest in learning the platform.

I'm excited to see how my journey with UniFi evolves. While I'm still in the early stages and quite comfortable and happy with Firewalla, the potential for customization and the breadth of the ecosystem are already apparent. It's like how I felt in 2019, when I had just scratched the surface of what AWS offers - there's so much more to explore!

## Advanced VLAN Usage and Network Segmentation

My exploration of VLANs went beyond basic network segmentation. One particularly useful application was the ability to create distinct trusted and untrusted networks, as well as "airgap" certain noisy or potentially insecure devices. Here's how I leveraged this:

1. Trusted Network: This VLAN includes personal devices, work equipment, and other devices that require full access to home network resources. It has the highest level of security and unrestricted internal access.

2. Untrusted Network: This VLAN is for devices that need internet access but shouldn't have access to the rest of the network. This includes guest devices, IoT gadgets with questionable security practices, and any device with frequent, unnecessary network chatter.

3. IoT Quarantine: Some smart home devices are isolated on their own VLAN. This prevents them from accessing other parts of my network while still allowing them to function and be controlled as needed.

4. Media Streaming Optimization: Devices like smart TVs and streaming boxes are on their own VLAN, allowing me to prioritize their traffic without affecting other network activities.

By strategically using VLANs, I've not only enhanced my network's security but also gained fine-grained control over how different devices interact and how network resources are allocated. This segmentation provides an additional layer of protection against potential security breaches and allows for more efficient network management.

### Traffic Shaping with CAKE and Smart Queues

For media streaming and overall network performance, I've implemented CAKE (Common Applications Kept Enhanced) and Smart Queues. These advanced Quality of Service (QoS) mechanisms help ensure that my network remains responsive even under heavy load:

- CAKE: This modern queuing discipline provides a sophisticated approach to traffic shaping. It helps reduce bufferbloat, ensures fair bandwidth allocation, and can significantly improve the responsiveness of your network, especially when it's approaching capacity.

- Smart Queues: This feature, available on my Firewalla, works in conjunction with CAKE to prioritize different types of traffic. It ensures that time-sensitive applications (like video calls or online gaming) get priority over less time-sensitive traffic (like large downloads).

By implementing these technologies, I've been able to maintain excellent streaming quality and low latency for gaming and video calls, even when the network is under heavy use.

### The Challenge of Advanced QoS

Setting up CAKE and Smart Queues was one of the more challenging aspects of my network optimization. It required a deep dive into understanding traffic patterns, application requirements, and the intricacies of network congestion. The learning curve was steep, involving lots of trial and error, but the results in terms of improved network responsiveness have been remarkable.

## Secure DNS and Privacy

In 2023, I implemented NextDNS across my network, a cloud-based DNS resolution service that offers security and privacy features.

### Benefits of NextDNS

1. Ad blocking at the DNS level
2. Protection against phishing and malware domains
3. Custom filtering rules and whitelists
4. Detailed analytics on network queries

I even created profiles for our mobile devices using Apple Configurator, ensuring they use DNS-over-HTTPS (DoH) for secure resolution regardless of the network they're connected to (even cellular).

While I considered running my own recursive DNS server using Unbound, the convenience and features of NextDNS have so far outweighed the potential privacy benefits of a self-hosted solution.

## Reflections and Future Directions

My home networking journey has been one of continuous learning and improvement. Each step has brought new challenges and insights, from understanding the intricacies of VLAN tagging to implementing multi-WAN failover configurations.

Looking back, I see how each technology I adopted built upon the last:

- Mesh networking solved coverage issues but had limitations in performance.
- MoCA adapters addressed the backhaul problem, improving overall network speed and reliability.
- Firewalla introduced advanced security features and routing capabilities.
- VLANs and managed switches allowed for logical network segmentation and improved security.
- Fiber internet and cellular failover provided speed and redundancy.
- UniFi APs offered a glimpse into more scalable, integrated network management.
- CAKE and Smart Queues optimized traffic flow and application performance.

As for the future, I'm keeping an eye on several emerging technologies:

1. Wi-Fi 6E and eventual Wi-Fi 7 standards, which promise even greater speeds and lower latency.
2. The increasing adoption of IPv6, which may alleviate some CGNAT-related issues.
3. Software-Defined Networking (SDN) technologies trickling down to prosumer equipment.
4. Integration of AI and machine learning for network optimization and threat detection.

### Expanding the UniFi Ecosystem

While I'm currently very satisfied with my Firewalla setup, I'm intrigued by the possibilities of expanding my UniFi ecosystem. I'm considering adopting UniFi cameras and possibly their doorbell system to create a more integrated smart home security setup. The idea of managing all these devices from a single interface is appealing.

One of my planned projects is to integrate UniFi cameras with HomeKit using Scrypted. This will allow me to view my UniFi camera feeds directly in the Home app on my Apple devices. Additionally, I plan to store the camera footage on my Synology NAS using Surveillance Station, Synology's network video recorder (NVR) solution. This setup will give me the best of both worlds: the robust features of UniFi's ecosystem and the convenience of HomeKit, all while maintaining control over my data with local storage.

### Future Hardware Upgrades

As my network continues to grow in complexity, I'm also contemplating getting a proper server rack. This would allow for a more organized and professional setup, potentially accommodating future hardware upgrades and making maintenance easier.

## Conclusion

My home network has evolved from a simple consumer-grade setup to a sophisticated system. This journey has not just been about improving my home's connectivity; it's been an educational experience that's given me a deep appreciation for the complexities of modern networking.

For those embarking on their own home networking projects, my advice is to start small, research thoroughly, and don't be afraid to experiment. The world of networking is vast and ever-changing, but with patience and curiosity, you can build a home network that perfectly suits your needs while providing a fantastic learning experience.

Remember, the goal isn't to have the most complex network, but rather one that's robust, secure, and manageable. Happy networking!

[Note: Network diagram to be added as soon as I get some time and patience to make it]