import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DNSConfigGenerator } from "@/lib/email-service";

interface DNSSetupRequest {
  churchDomain: string;
  subdomain?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: DNSSetupRequest = await request.json();
    
    if (!body.churchDomain) {
      return NextResponse.json({ 
        error: "Church domain is required" 
      }, { status: 400 });
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(body.churchDomain)) {
      return NextResponse.json({ 
        error: "Invalid domain format" 
      }, { status: 400 });
    }

    const dnsSetup = DNSConfigGenerator.generateSubdomainSetup(
      body.churchDomain, 
      body.subdomain || 'mail'
    );

    return NextResponse.json(dnsSetup);

  } catch (error) {
    console.error('Error generating DNS setup:', error);
    return NextResponse.json({ 
      error: "Failed to generate DNS setup" 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');
    
    if (!domain) {
      return NextResponse.json({ 
        error: "Domain parameter is required" 
      }, { status: 400 });
    }

    // Verify DNS records
    const verification = await DNSConfigGenerator.verifyDNSRecords(domain);

    return NextResponse.json(verification);

  } catch (error) {
    console.error('Error verifying DNS records:', error);
    return NextResponse.json({ 
      error: "Failed to verify DNS records" 
    }, { status: 500 });
  }
}