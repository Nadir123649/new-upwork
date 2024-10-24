import React from 'react';

const SymbolList = () => {
  const symbolData = [
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AMZN", name: "Amazon.com, Inc." },
    { symbol: "GOOGL", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms, Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "CRM", name: "Salesforce, Inc." },
    { symbol: "ADBE", name: "Adobe Inc." },
    { symbol: "INTC", name: "Intel Corporation" },
    { symbol: "CSCO", name: "Cisco Systems, Inc." },
    { symbol: "IBM", name: "International Business Machines Corporation" },
    { symbol: "ORCL", name: "Oracle Corporation" },
    { symbol: "AMD", name: "Advanced Micro Devices, Inc." },
    { symbol: "TXN", name: "Texas Instruments Incorporated" },
    { symbol: "QCOM", name: "QUALCOMM Incorporated" },
    { symbol: "MU", name: "Micron Technology, Inc." },
    { symbol: "AVGO", name: "Broadcom Inc." },
    { symbol: "ADI", name: "Analog Devices, Inc." },
    { symbol: "MXIM", name: "Maxim Integrated Products, Inc." },
    { symbol: "SWKS", name: "Skyworks Solutions, Inc." },
    { symbol: "MCHP", name: "Microchip Technology Incorporated" },
    { symbol: "NXPI", name: "NXP Semiconductors N.V." },
    { symbol: "ANET", name: "Arista Networks, Inc." },
    { symbol: "APH", name: "Amphenol Corporation" },
    { symbol: "TEL", name: "TE Connectivity Ltd." },
    { symbol: "KEYS", name: "Keysight Technologies, Inc." },
    { symbol: "XLNX", name: "Xilinx, Inc." },
    { symbol: "QRVO", name: "Qorvo, Inc." },
    { symbol: "INTU", name: "Intuit Inc." },
    { symbol: "NOW", name: "ServiceNow, Inc." },
    { symbol: "WDAY", name: "Workday, Inc." },
    { symbol: "SPLK", name: "Splunk Inc." },
    { symbol: "TEAM", name: "Atlassian Corporation Plc" },
    { symbol: "ANSS", name: "ANSYS, Inc." },
    { symbol: "CDNS", name: "Cadence Design Systems, Inc." },
    { symbol: "SNPS", name: "Synopsys, Inc." },
    { symbol: "ADSK", name: "Autodesk, Inc." },
    { symbol: "PAYC", name: "Paycom Software, Inc." },
    { symbol: "VMW", name: "VMware, Inc." },
    { symbol: "CTXS", name: "Citrix Systems, Inc." },
    { symbol: "EPAM", name: "EPAM Systems, Inc." },
    { symbol: "ZEN", name: "Zendesk, Inc." },
    { symbol: "DOCU", name: "DocuSign, Inc." },
    { symbol: "ZM", name: "Zoom Video Communications, Inc." },
    { symbol: "FTNT", name: "Fortinet, Inc." },
    { symbol: "CRWD", name: "CrowdStrike Holdings, Inc." },
    { symbol: "ZS", name: "Zscaler, Inc." },
    { symbol: "OKTA", name: "Okta, Inc." },
    { symbol: "NET", name: "Cloudflare, Inc." },
    { symbol: "PANW", name: "Palo Alto Networks, Inc." },
    { symbol: "JNPR", name: "Juniper Networks, Inc." },
    { symbol: "FFIV", name: "F5 Networks, Inc." },
    { symbol: "VRSN", name: "VeriSign, Inc." },
    { symbol: "CYBR", name: "CyberArk Software Ltd." },
    { symbol: "PING", name: "Ping Identity Holding Corp." },
    { symbol: "FEYE", name: "FireEye, Inc." },
    { symbol: "SNOW", name: "Snowflake Inc." },
    { symbol: "MDB", name: "MongoDB, Inc." },
    { symbol: "DDOG", name: "Datadog, Inc." },
    { symbol: "DBX", name: "Dropbox, Inc." },
    { symbol: "TDG", name: "TransDigm Group Incorporated" },
    { symbol: "MSCI", name: "MSCI Inc." },
    { symbol: "FDS", name: "FactSet Research Systems Inc." },
    { symbol: "SPGI", name: "S&P Global Inc." },
    { symbol: "MCO", name: "Moody's Corporation" },
    { symbol: "VRSK", name: "Verisk Analytics, Inc." },
    { symbol: "IQV", name: "IQVIA Holdings Inc." },
    { symbol: "IT", name: "Gartner, Inc." },
    { symbol: "ESTC", name: "Elastic N.V." },
    { symbol: "AYX", name: "Alteryx, Inc." },
    { symbol: "NEWR", name: "New Relic, Inc." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "MA", name: "Mastercard Incorporated" },
    { symbol: "PYPL", name: "PayPal Holdings, Inc." },
    { symbol: "SQ", name: "Square, Inc." },
    { symbol: "AFRM", name: "Affirm Holdings, Inc." },
    { symbol: "COIN", name: "Coinbase Global, Inc." },
    { symbol: "HOOD", name: "Robinhood Markets, Inc." },
    { symbol: "FIS", name: "Fidelity National Information Services, Inc." },
    { symbol: "FISV", name: "Fiserv, Inc." },
    { symbol: "GPN", name: "Global Payments Inc." },
    { symbol: "NVEI", name: "Nuvei Corporation" },
    { symbol: "PAYO", name: "Payoneer Global Inc." },
    { symbol: "FLYW", name: "Flywire Corporation" },
    { symbol: "ALKT", name: "Alkami Technology, Inc." },
    { symbol: "ETSY", name: "Etsy, Inc." },
    { symbol: "SHOP", name: "Shopify Inc." },
    { symbol: "PINS", name: "Pinterest, Inc." },
    { symbol: "ABNB", name: "Airbnb, Inc." },
    { symbol: "UBER", name: "Uber Technologies, Inc." },
    { symbol: "LYFT", name: "Lyft, Inc." },
    { symbol: "DASH", name: "DoorDash, Inc." },
    { symbol: "BKNG", name: "Booking Holdings Inc." },
    { symbol: "EXPE", name: "Expedia Group, Inc." },
    { symbol: "CHWY", name: "Chewy, Inc." },
    { symbol: "W", name: "Wayfair Inc." },
    { symbol: "CPNG", name: "Coupang, Inc." },
    { symbol: "WISH", name: "ContextLogic Inc." },
    { symbol: "TDUP", name: "ThredUp Inc." },
    { symbol: "NFLX", name: "Netflix, Inc." },
    { symbol: "DIS", name: "The Walt Disney Company" },
    { symbol: "CMCSA", name: "Comcast Corporation" },
    { symbol: "SPOT", name: "Spotify Technology S.A." },
    { symbol: "SNAP", name: "Snap Inc." },
    { symbol: "RBLX", name: "Roblox Corporation" },
    { symbol: "EA", name: "Electronic Arts Inc." },
    { symbol: "ATVI", name: "Activision Blizzard, Inc." },
    { symbol: "TTWO", name: "Take-Two Interactive Software, Inc." },
    { symbol: "MTCH", name: "Match Group, Inc." },
    { symbol: "ROKU", name: "Roku, Inc." },
    { symbol: "ZG", name: "Zillow Group, Inc." },
    { symbol: "BMBL", name: "Bumble Inc." },
    { symbol: "T", name: "AT&T Inc." },
    { symbol: "VZ", name: "Verizon Communications Inc." },
    { symbol: "TMUS", name: "T-Mobile US, Inc." },
    { symbol: "LUMN", name: "Lumen Technologies, Inc." },
    { symbol: "DISH", name: "DISH Network Corporation" },
    { symbol: "RNG", name: "RingCentral, Inc." },
    { symbol: "WORK", name: "Slack Technologies, Inc." },
    { symbol: "FIVN", name: "Five9, Inc." },
    { symbol: "TWLO", name: "Twilio Inc." },
    { symbol: "BAND", name: "Bandwidth Inc." },
    { symbol: "IRTC", name: "iRhythm Technologies, Inc." },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "BAC", name: "Bank of America Corporation" },
    { symbol: "C", name: "Citigroup Inc." },
    { symbol: "WFC", name: "Wells Fargo & Company" },
    { symbol: "GS", name: "The Goldman Sachs Group, Inc." },
    { symbol: "MS", name: "Morgan Stanley" },
    { symbol: "USB", name: "U.S. Bancorp" },
    { symbol: "PNC", name: "The PNC Financial Services Group, Inc." },
    { symbol: "TFC", name: "Truist Financial Corporation" },
    { symbol: "FITB", name: "Fifth Third Bancorp" },
    { symbol: "KEY", name: "KeyCorp" },
    { symbol: "RF", name: "Regions Financial Corporation" },
    { symbol: "SIVB", name: "SVB Financial Group" },
    { symbol: "SCHW", name: "The Charles Schwab Corporation" },
    { symbol: "AXP", name: "American Express Company" },
    { symbol: "COF", name: "Capital One Financial Corporation" },
    { symbol: "BLK", name: "BlackRock, Inc." },
    { symbol: "CERN", name: "Cerner Corporation" },
    { symbol: "VEEV", name: "Veeva Systems Inc." },
    { symbol: "TDOC", name: "Teladoc Health, Inc." },
    { symbol: "DXCM", name: "DexCom, Inc." },
    { symbol: "HOLX", name: "Hologic, Inc." },
    { symbol: "TMO", name: "Thermo Fisher Scientific Inc." },
    { symbol: "ISRG", name: "Intuitive Surgical, Inc." },
    { symbol: "ALGN", name: "Align Technology, Inc." },
    { symbol: "ILMN", name: "Illumina, Inc." },
    { symbol: "ABMD", name: "ABIOMED, Inc." },
    { symbol: "EW", name: "Edwards Lifesciences Corporation" },
    { symbol: "INCY", name: "Incyte Corporation" },
    { symbol: "CERT", name: "Certara, Inc." },
    { symbol: "OSCR", name: "Oscar Health, Inc." },
    { symbol: "AMGN", name: "Amgen Inc." },
    { symbol: "GILD", name: "Gilead Sciences, Inc." },
    { symbol: "REGN", name: "Regeneron Pharmaceuticals, Inc." },
    { symbol: "VRTX", name: "Vertex Pharmaceuticals Incorporated" },
    { symbol: "BIIB", name: "Biogen Inc." },
    { symbol: "JNJ", name: "Johnson & Johnson" },
    { symbol: "PFE", name: "Pfizer Inc." },
    { symbol: "MRK", name: "Merck & Co., Inc." },
    { symbol: "BMY", name: "Bristol-Myers Squibb Company" },
    { symbol: "LLY", name: "Eli Lilly and Company" },
    { symbol: "ABT", name: "Abbott Laboratories" },
    { symbol: "MRNA", name: "Moderna, Inc." },
    { symbol: "BNTX", name: "BioNTech SE" },
    { symbol: "NVAX", name: "Novavax, Inc." },
    { symbol: "SGEN", name: "Seagen Inc." },
    { symbol: "BEAM", name: "Beam Therapeutics Inc." },
    { symbol: "SANA", name: "Sana Biotechnology, Inc." },
    { symbol: "HON", name: "Honeywell International Inc." },
    { symbol: "MMM", name: "3M Company" },
    { symbol: "GE", name: "General Electric Company" },
    { symbol: "EMR", name: "Emerson Electric Co." },
    { symbol: "ROK", name: "Rockwell Automation, Inc." },
    { symbol: "IR", name: "Ingersoll Rand Inc." },
    { symbol: "PH", name: "Parker-Hannifin Corporation" },
    { symbol: "AME", name: "AMETEK, Inc." },
    { symbol: "ROP", name: "Roper Technologies, Inc." },
    { symbol: "TT", name: "Trane Technologies plc" },
    { symbol: "ETN", name: "Eaton Corporation plc" },
    { symbol: "DOV", name: "Dover Corporation" },
    { symbol: "ITW", name: "Illinois Tool Works Inc." },
    { symbol: "CMI", name: "Cummins Inc." },
    { symbol: "CAT", name: "Caterpillar Inc." },
    { symbol: "DE", name: "Deere & Company" },
    { symbol: "TSLA", name: "Tesla, Inc." },
    { symbol: "GM", name: "General Motors Company" },
    { symbol: "F", name: "Ford Motor Company" },
    { symbol: "APTV", name: "Aptiv PLC" },
    { symbol: "LEA", name: "Lear Corporation" },
    { symbol: "BWA", name: "BorgWarner Inc." },
    { symbol: "PCAR", name: "PACCAR Inc" },
    { symbol: "TM", name: "Toyota Motor Corporation" },
    { symbol: "HMC", name: "Honda Motor Co., Ltd." },
    { symbol: "RACE", name: "Ferrari N.V." },
    { symbol: "LCID", name: "Lucid Group, Inc." },
    { symbol: "RIVN", name: "Rivian Automotive, Inc." },
    { symbol: "BA", name: "The Boeing Company" },
    { symbol: "LMT", name: "Lockheed Martin Corporation" },
    { symbol: "RTX", name: "Raytheon Technologies Corporation" },
    { symbol: "NOC", name: "Northrop Grumman Corporation" },
    { symbol: "GD", name: "General Dynamics Corporation" },
    { symbol: "TDY", name: "Teledyne Technologies Incorporated" },
    { symbol: "HEI", name: "HEICO Corporation" },
    { symbol: "SPR", name: "Spirit AeroSystems Holdings, Inc." },
    { symbol: "TXT", name: "Textron Inc." },
    { symbol: "KTOS", name: "Kratos Defense & Security Solutions, Inc." },
    { symbol: "LHX", name: "L3Harris Technologies, Inc." },
    { symbol: "HII", name: "Huntington Ingalls Industries, Inc." },
    { symbol: "WMT", name: "Walmart Inc." },
    { symbol: "TGT", name: "Target Corporation" },
    { symbol: "COST", name: "Costco Wholesale Corporation" },
    { symbol: "LOW", name: "Lowe's Companies, Inc." },
    { symbol: "HD", name: "The Home Depot, Inc." },
    { symbol: "BBY", name: "Best Buy Co., Inc." },
    { symbol: "EBAY", name: "eBay Inc." },
    { symbol: "CVNA", name: "Carvana Co." },
    { symbol: "KR", name: "The Kroger Co." },
    { symbol: "AZO", name: "AutoZone, Inc." },
    { symbol: "ORLY", name: "O'Reilly Automotive, Inc." },
    { symbol: "ULTA", name: "Ulta Beauty, Inc." },
    { symbol: "DG", name: "Dollar General Corporation" },
    { symbol: "DLTR", name: "Dollar Tree, Inc." },
    { symbol: "XOM", name: "Exxon Mobil Corporation" },
    { symbol: "CVX", name: "Chevron Corporation" },
    { symbol: "COP", name: "ConocoPhillips" },
    { symbol: "EOG", name: "EOG Resources, Inc." },
    { symbol: "SLB", name: "Schlumberger Limited" },
    { symbol: "HAL", name: "Halliburton Company" },
    { symbol: "BKR", name: "Baker Hughes Company" },
    { symbol: "NEE", name: "NextEra Energy, Inc." },
    { symbol: "DUK", name: "Duke Energy Corporation" },
    { symbol: "SO", name: "The Southern Company" },
    { symbol: "D", name: "Dominion Energy, Inc." },
    { symbol: "EXC", name: "Exelon Corporation" },
    { symbol: "AEP", name: "American Electric Power Company, Inc." },
    { symbol: "SRE", name: "Sempra Energy" },
    { symbol: "WEC", name: "WEC Energy Group, Inc." },
    { symbol: "ICE", name: "Intercontinental Exchange, Inc." },
    { symbol: "CME", name: "CME Group Inc." },
    { symbol: "NDAQ", name: "Nasdaq, Inc." },
    { symbol: "MKTX", name: "MarketAxess Holdings Inc." },
    { symbol: "CBOE", name: "Cboe Global Markets, Inc." },
    { symbol: "LSEG", name: "London Stock Exchange Group plc" },
    { symbol: "TW", name: "Tradeweb Markets Inc." },
    { symbol: "VIRT", name: "Virtu Financial, Inc." },
    { symbol: "IBKR", name: "Interactive Brokers Group, Inc." },
    { symbol: "PLTR", name: "Palantir Technologies Inc." },
    { symbol: "U", name: "Unity Software Inc." },
    { symbol: "PATH", name: "UiPath Inc." },
    { symbol: "CFLT", name: "Confluent, Inc." },
    { symbol: "ZI", name: "ZoomInfo Technologies Inc." },
    { symbol: "BILL", name: "Bill.com Holdings, Inc." },
    { symbol: "HUBS", name: "HubSpot, Inc." },
    { symbol: "AI", name: "C3.ai, Inc." },
    { symbol: "APP", name: "AppLovin Corporation" },
    { symbol: "MQ", name: "Marqeta, Inc." },
    { symbol: "GTLB", name: "GitLab Inc." },
    { symbol: "DOCN", name: "DigitalOcean Holdings, Inc." },
    { symbol: "SQSP", name: "Squarespace, Inc." },
    { symbol: "INFA", name: "Informatica Inc." },
    { symbol: "BASE", name: "Couchbase, Inc." },
    { symbol: "TWKS", name: "Thoughtworks Holding, Inc." },
    { symbol: "PG", name: "The Procter & Gamble Company" },
    { symbol: "KO", name: "The Coca-Cola Company" },
    { symbol: "PEP", name: "PepsiCo, Inc." },
    { symbol: "CL", name: "Colgate-Palmolive Company" },
    { symbol: "KMB", name: "Kimberly-Clark Corporation" },
    { symbol: "EL", name: "The Estée Lauder Companies Inc." },
    { symbol: "NKE", name: "NIKE, Inc." },
    { symbol: "MCD", name: "McDonald's Corporation" },
    { symbol: "SBUX", name: "Starbucks Corporation" },
    { symbol: "YUM", name: "Yum! Brands, Inc." },
    { symbol: "STZ", name: "Constellation Brands, Inc." },
    { symbol: "MO", name: "Altria Group, Inc." },
    { symbol: "PM", name: "Philip Morris International Inc." },
    { symbol: "MDLZ", name: "Mondelez International, Inc." },
    { symbol: "HSY", name: "The Hershey Company" },
    { symbol: "K", name: "Kellogg Company" },
    { symbol: "GIS", name: "General Mills, Inc." },
    { symbol: "CPB", name: "Campbell Soup Company" },
    { symbol: "MKC", name: "McCormick & Company, Incorporated" },
    { symbol: "CLX", name: "The Clorox Company" }
  ];

  return (
    <div className="subsection">
      <h3>Available Companies</h3>
      <p>The following symbols are available for analysis in our platform:</p>
      <div className="symbol-list">
        {symbolData.map((item, index) => (
          <div key={index} className="symbol-item">
            <span className="symbol">{item.symbol}</span>
            <span className="company-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SymbolList;