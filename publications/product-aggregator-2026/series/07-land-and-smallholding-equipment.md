# Land and smallholding equipment

## What is the business?

The business helps owners and operators of smallholdings, rural properties, woodland and larger gardens choose, source and maintain equipment. It is not a conventional affiliate catalogue.

Its promise is:

> Find the right equipment for the land, understand the condition and ownership cost, and connect with a credible seller or dealer.

The vertical joins compact tractors, mini diggers, wood chippers, log splitters, trailers, polytunnels, animal housing and specialist preservation equipment around the work of running land. It should remain separate from premium garden systems because its purchase path, buyer expectations and data model are materially different.

## Who is the target buyer?

- Smallholders and rural homeowners.
- Landscapers, groundskeepers and tree professionals.
- Self-builders and renovators managing a plot.
- Owners of woodland or several acres.
- Equestrian and livestock operators.
- Buyers moving from hired machinery to ownership.
- Dealers who need qualified demand and inventory distribution.

These buyers care about output, access, attachments, transport, reliability, service and residual value. The visual condition and history of one machine can matter more than the nominal model.

## What commercial demand supports it?

The high-ticket canonical basket contains 11,850 average monthly UK searches at £0.59 volume-weighted historical CPC.

| Equipment family   | Canonical phrase           | Searches |   CPC |
| ------------------ | -------------------------- | -------: | ----: |
| Mini diggers       | mini digger for sale       |    5,400 | £0.43 |
| Log splitters      | log splitter for sale      |    3,600 | £0.77 |
| Wood chippers      | wood chipper for sale      |    1,900 | £0.92 |
| Compact tractors   | compact tractor for sale   |      480 | £0.09 |
| Plant trailers     | plant trailer for sale     |      210 | £0.22 |
| Livestock trailers | livestock trailer for sale |      170 | £0.04 |
| Freeze dryers      | freeze dryer for sale      |       90 | £0.67 |

Two adjacent categories were measured but excluded from the high-ticket total because their generic phrase spans too wide an order-value range:

- `chicken coop for sale`: 3,600 at £0.84.
- `polytunnel for sale`: 1,600 at £0.57.

The commercial intent is real. The unresolved issue is what kind of transaction the searcher expects.

## Why is the retailer-feed model insufficient?

The phrase `for sale` does not distinguish:

- new from used;
- dealer from private seller;
- domestic imported machine from established manufacturer;
- outright purchase from finance;
- inspected stock from an unverified listing;
- machine-only price from attachments and delivery;
- purchase from hire comparison.

The same model can have several conditions, hours, attachments, service histories and delivery locations. GTINs are often absent or irrelevant. A merchant product feed designed for boxed ecommerce does not represent the transaction well.

The correct core objects are:

```text
machine model → individual asset → condition evidence → seller → location
              → price → finance/delivery → enquiry → inspection → sale
```

That is a marketplace and lead graph, not merely `Product` plus several `Offer` rows.

## How should the information architecture work?

### Move and shape land

- Compact tractors.
- Mini and micro diggers.
- Attachments and implements.
- Plant trailers and transport.

### Process timber and green waste

- Wood chippers.
- Log splitters.
- Saws and handling equipment where AOV and safety justify coverage.
- PTO and standalone machine compatibility.

### Grow and preserve

- Polytunnels and protected growing systems.
- Irrigation and water storage after commercial validation.
- Freeze dryers and processing equipment.

### Keep animals

- Livestock trailers.
- Durable housing and handling equipment.
- Fencing systems only where the purchase remains project-scale.

### Own and operate machinery

- New-versus-used guidance.
- Finance and insurance.
- Inspection and condition.
- Transport.
- Service, parts and maintenance.
- Hire-versus-buy calculators.

## What product should sit at the centre?

### Work-to-machine selector

The buyer describes acreage, terrain, access, material, task frequency, towing capacity, storage, service distance and budget. The result recommends machine classes before individual listings.

This prevents category mistakes: buying an underpowered chipper, a digger too wide for access, a tractor without lift capacity or a splitter incompatible with available power.

### New and used inventory search

Listings should expose:

- manufacturer, model and year;
- serial or asset identifier where appropriate and safe;
- engine or operating hours;
- power, weight and dimensions;
- attachments included;
- ownership and service history;
- known defects and repairs;
- inspection status;
- VAT status;
- seller type and location;
- finance, transport and warranty;
- evidence timestamp.

Missing history must remain visible. “Not supplied” is a decision field, not a blank to hide.

### Hire-versus-buy calculator

Inputs:

- expected days of use per year;
- local hire and delivery cost;
- purchase price;
- finance cost;
- depreciation and expected resale;
- insurance;
- maintenance and storage;
- operator time.

The calculator can legitimately recommend hire. An aggregator that always concludes “buy” will lose trust and attract poor leads.

### Dealer and service map

Service distance strongly affects ownership. The map should connect listings and models to dealer coverage, parts, mobile technicians and attachment support. It must distinguish claimed service area from verified operations.

## What is the viable business model?

### Dealer subscriptions and inventory plans

Dealers pay for a defined inventory allowance, feed ingestion, lead routing and performance reporting. Mini Diggers currently offers individual and dealer listing plans, demonstrating the model's presence. [Mini Diggers listing plans](https://www.mini-diggers.co.uk/select-your-plan/)

### Paid private listings

Private sellers pay once for a time-bounded listing with structured evidence and fraud controls. Optional services can include photography standards, inspection, finance introduction or promoted placement. Promotion must remain visibly separate from relevance ranking.

### Qualified enquiries

A dealer can pay per accepted enquiry when the platform establishes work type, budget, postcode, timing, machine class and contact permission. Raw form fills and accepted opportunities must remain separate events.

### Finance, transport and inspection referrals

These can become valuable because they sit inside the actual purchase workflow. They also introduce regulated or liability-sensitive relationships and should be added only with reviewed terms and qualified partners.

### Affiliate revenue on boxed equipment

Log splitters, smaller chippers, accessories and some workshop products may still transact through retailer programmes. Machine Mart offers 2% commission and a 30-day cookie across a large catalogue. [Machine Mart programme](https://www.machinemart.co.uk/affiliates/) This is supplementary revenue, not the thesis.

## What are the economics?

Search CPC is low, but affiliate commission cannot be assumed because many transactions occur offline or through private sellers.

A lead scenario should use:

```text
raw enquiry value = accepted-enquiry fee × acceptance rate
```

Illustrative example:

| Input                           | Conservative | Base | Upside |
| ------------------------------- | -----------: | ---: | -----: |
| Dealer fee per accepted enquiry |          £50 | £100 |   £180 |
| Raw-to-accepted rate            |          20% |  35% |    50% |
| Gross value per raw enquiry     |          £10 |  £35 |    £90 |

At a £0.43 click for mini-digger demand, even modest click-to-enquiry rates can appear attractive. The model remains unproven until dealers confirm acceptance definitions, territory, capacity and price. These are scenarios, not observed market terms.

Subscriptions can reduce attribution disputes but require enough inventory demand and measurable leads to retain dealers. The platform should not charge dealers before it can show qualified activity.

## What would the launch wedge be?

Launch with compact land machinery in one UK region or a tightly defined national class:

1. Choose mini and micro diggers or compact tractors, not the whole smallholding.
2. Recruit ten dealers with structured inventory exports or manual upload.
3. Create one condition and evidence standard.
4. Publish work-to-machine and hire-versus-buy tools.
5. Add dealer coverage and delivery radius.
6. Route enquiries with explicit qualification fields.
7. Give founding dealers free or success-based access while measuring quality.
8. Introduce paid listings only after repeat demand is visible.

This launch is operationally heavier than garden, games rooms or maker studios. It requires supply acquisition before the consumer experience is useful.

## What would make this vertical fail?

- Dealers do not provide fresh, structured inventory.
- Used listings create fraud, misdescription or condition disputes the platform cannot manage.
- Most search demand is hire intent despite purchase modifiers.
- Sellers already receive sufficient demand from entrenched marketplaces.
- Geographic fragmentation prevents liquid local choice.
- Lead acceptance is subjective and creates billing disputes.
- Transport, finance and inspection complexity outgrow the platform's operating capacity.
- Boxed affiliate products dilute the high-ticket machinery proposition.

## What remains unknown?

- New-versus-used-versus-hire intent share by keyword.
- Dealer density and inventory by region.
- Existing marketplace fees, lead prices and dealer satisfaction.
- Fraud, moderation and dispute burden.
- Conversion from search to enquiry and enquiry to sale.
- Willingness to pay for listings before marketplace liquidity.
- Legal and insurance implications of inspection and condition claims.

The vertical is commercially interesting enough to deserve its own future research pack. It should not be treated as an easy extension of an Awin-first affiliate platform.
