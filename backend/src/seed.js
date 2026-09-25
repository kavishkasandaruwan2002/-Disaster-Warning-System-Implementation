const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const { District, RiverBasin, Citizen, Organisation, Notification } = require('./shared/models');
const GroundReport = require('./modules/ground-report/ground-report.model');
const HazardAlert = require('./modules/hazard-warning/hazard-warning.model');
const { Shelter, RescueTeam, ReliefSupply } = require('./modules/resource-coordination/resource-coordination.model');
const AnalysisReport = require('./modules/analysis-report/analysis-report.model');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('Seeding database...');

    // Clear existing collections
    await District.deleteMany({});
    await RiverBasin.deleteMany({});
    await Citizen.deleteMany({});
    await Organisation.deleteMany({});
    await Notification.deleteMany({});
    await GroundReport.deleteMany({});
    await HazardAlert.deleteMany({});
    await Shelter.deleteMany({});
    await RescueTeam.deleteMany({});
    await ReliefSupply.deleteMany({});
    await AnalysisReport.deleteMany({});

    // 1. Create 1 RiverBasin first
    const riverBasin = await RiverBasin.create({
      basinId: 'BASIN-001',
      name: 'Kelani River Basin',
      districts: []
    });

    // 2. Create 3 Districts (2 linked to riverBasin)
    const district1 = await District.create({
      districtId: 'DIST-001',
      name: 'Colombo',
      riverBasin: riverBasin._id,
      citizenCount: 5
    });

    const district2 = await District.create({
      districtId: 'DIST-002',
      name: 'Gampaha',
      riverBasin: riverBasin._id,
      citizenCount: 5
    });

    const district3 = await District.create({
      districtId: 'DIST-003',
      name: 'Kalutara',
      riverBasin: null,
      citizenCount: 5
    });

    // Update riverBasin districts array
    riverBasin.districts = [district1._id, district2._id];
    await riverBasin.save();

    // 3. Create 4 Organisations (one of each type)
    const orgs = await Organisation.create([
      {
        orgId: 'ORG-001',
        name: 'Disaster Management Centre (DMC)',
        type: 'GovernmentBody'
      },
      {
        orgId: 'ORG-002',
        name: 'Sri Lanka Navy Disaster Response Unit',
        type: 'ArmedForcesUnit'
      },
      {
        orgId: 'ORG-003',
        name: 'Red Cross Sri Lanka',
        type: 'NGO'
      },
      {
        orgId: 'ORG-004',
        name: 'Global Emergency Aid Fund',
        type: 'PrivateDonor'
      }
    ]);

    // 4. Create 15 Citizens (5 per district)
    const citizenData = [];
    const districts = [district1, district2, district3];

    for (let d = 0; d < districts.length; d++) {
      const dist = districts[d];
      for (let i = 1; i <= 5; i++) {
        const idNum = d * 5 + i;
        citizenData.push({
          nationalId: `199012345${idNum < 10 ? '0' + idNum : idNum}V`,
          name: `Citizen ${dist.name} ${i}`,
          homeAddress: `${10 * i} Main St, ${dist.name}`,
          districtId: dist._id,
          pushToken: `exponent-push-token-cit-${idNum}`,
          phone: `+947700000${idNum < 10 ? '0' + idNum : idNum}`
        });
      }
    }

    const citizens = await Citizen.create(citizenData);

    // 5. Seed initial Shelters
    const shelters = await Shelter.create([
      {
        shelterId: 'SHELTER-001',
        name: 'Colombo Central Community Hall Shelter',
        location: '12 Stadium Road, Colombo',
        capacity: 200,
        currentOccupancy: 45,
        districtId: district1._id,
        ownerOrgId: orgs[0]._id,
        status: 'OPEN'
      },
      {
        shelterId: 'SHELTER-002',
        name: 'Gampaha Secondary School Relief Centre',
        location: '5 School Lane, Gampaha',
        capacity: 150,
        currentOccupancy: 150,
        districtId: district2._id,
        ownerOrgId: orgs[2]._id,
        status: 'FULL'
      },
      {
        shelterId: 'SHELTER-003',
        name: 'Kalutara Coastal Safety Shelter',
        location: 'Beach Road, Kalutara',
        capacity: 300,
        currentOccupancy: 0,
        districtId: district3._id,
        ownerOrgId: orgs[0]._id,
        status: 'OPEN'
      }
    ]);

    // 6. Seed initial Rescue Teams
    const rescueTeams = await RescueTeam.create([
      {
        teamId: 'TEAM-001',
        name: 'Alpha Water Rescue Squad',
        status: 'AVAILABLE',
        currentLocation: 'Colombo Naval Base',
        ownerOrgId: orgs[1]._id,
        districtId: district1._id
      },
      {
        teamId: 'TEAM-002',
        name: 'Bravo Rapid Relief Unit',
        status: 'DISPATCHED',
        currentLocation: 'Gampaha Sector 4 Flood Plain',
        ownerOrgId: orgs[1]._id,
        districtId: district2._id
      },
      {
        teamId: 'TEAM-003',
        name: 'Red Cross First Response Team',
        status: 'AVAILABLE',
        currentLocation: 'Kalutara Town Centre',
        ownerOrgId: orgs[2]._id,
        districtId: district3._id
      }
    ]);

    // 7. Seed initial Relief Supplies
    await ReliefSupply.create([
      {
        supplyId: 'SUPPLY-001',
        supplyType: 'Food',
        quantity: 1000,
        distributedQuantity: 250,
        ownerOrgId: orgs[2]._id,
        districtId: district1._id
      },
      {
        supplyId: 'SUPPLY-002',
        supplyType: 'Water',
        quantity: 2000,
        distributedQuantity: 800,
        ownerOrgId: orgs[3]._id,
        districtId: district1._id
      },
      {
        supplyId: 'SUPPLY-003',
        supplyType: 'Medicine',
        quantity: 500,
        distributedQuantity: 100,
        ownerOrgId: orgs[0]._id,
        districtId: district2._id
      },
      {
        supplyId: 'SUPPLY-004',
        supplyType: 'ShelterMaterial',
        quantity: 300,
        distributedQuantity: 50,
        ownerOrgId: orgs[2]._id,
        districtId: district3._id
      }
    ]);

    // 8. Seed initial Ground Reports
    const report1 = await GroundReport.create({
      reportId: 'REP-1001',
      hazardType: 'Flood',
      description: 'Water levels rising rapidly near Kelani bridge in Colombo.',
      photoUrl: 'flood_colombo_01.jpg',
      gpsLat: 6.9271,
      gpsLng: 79.8612,
      submittedTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h ago
      submittedBy: citizens[0]._id,
      districtId: district1._id,
      verificationStatus: 'PENDING',
      severityLevel: 'HIGH'
    });

    const report2 = await GroundReport.create({
      reportId: 'REP-1002',
      hazardType: 'Landslide',
      description: 'Minor earth collapse near hillside road in Kalutara.',
      photoUrl: 'landslide_kalutara_01.jpg',
      gpsLat: 6.5854,
      gpsLng: 79.9607,
      submittedTime: new Date(Date.now() - 5 * 60 * 60 * 1000),
      submittedBy: citizens[10]._id,
      districtId: district3._id,
      verificationStatus: 'VERIFIED',
      verifiedBy: 'Duty Officer Jayasuriya',
      verifiedTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
      severityLevel: 'LOW'
    });

    // 9. Seed initial Hazard Alert
    const alert1 = await HazardAlert.create({
      alertId: 'ALERT-2001',
      hazardType: 'Flood',
      severityLevel: 'Watch',
      targetDistrictIds: [district1._id, district2._id],
      targetRiverBasinId: riverBasin._id,
      message: 'Kelani river water level reaching watch threshold. Prepare emergency kits.',
      issuedTime: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'ACTIVE'
    });

    // Seed notifications for alert1
    const notificationDocs = [];
    const targetCitizens = citizens.filter(c => 
      c.districtId.toString() === district1._id.toString() || 
      c.districtId.toString() === district2._id.toString()
    );

    let notifCounter = 1;
    for (const citizen of targetCitizens) {
      for (const channel of ['PUSH', 'SMS', 'AUDIBLE']) {
        notificationDocs.push({
          notificationId: `NOTIF-${1000 + notifCounter++}`,
          hazardAlertId: alert1._id,
          citizenId: citizen._id,
          channel: channel,
          sentTime: new Date(Date.now() - 55 * 60 * 1000),
          deliveryStatus: Math.random() < 0.9 ? 'SENT' : 'FAILED'
        });
      }
    }
    await Notification.create(notificationDocs);

    console.log('Database seeded successfully!');
    console.log(`- 1 RiverBasin: ${riverBasin.name}`);
    console.log(`- 3 Districts: ${district1.name}, ${district2.name}, ${district3.name}`);
    console.log(`- 15 Citizens created across districts`);
    console.log(`- 4 Organisations created`);
    console.log(`- Shelters, Rescue Teams, Relief Supplies, Reports and Alerts initialized.`);

    if (process.env.NODE_ENV !== 'test') {
      process.exit(0);
    }
  } catch (error) {
    console.error('Error seeding database:', error);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
