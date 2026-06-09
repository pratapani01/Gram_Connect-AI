require('dotenv').config();
const mongoose = require('mongoose');
const { State, District, Village } = require('../models/Location');

const locationData = [
  {
    name: 'Uttarakhand', code: 'UK',
    districts: [
      { name: 'Dehradun', villages: ['Dehradun City', 'Rishikesh', 'Doiwala', 'Vikasnagar', 'Chakrata', 'Mussoorie', 'Sahaspur', 'Raipur', 'Premnagar', 'Selaqui'] },
      { name: 'Haridwar', villages: ['Haridwar City', 'Roorkee', 'Laksar', 'Manglaur', 'Jwalapur', 'Bahadrabad', 'Rurkee Rural', 'Libarhedi', 'Narsen', 'Kankhal'] },
      { name: 'Nainital', villages: ['Nainital City', 'Haldwani', 'Ramnagar', 'Bhowali', 'Kaladhungi', 'Lalkuan', 'Kathgodam', 'Corbett', 'Dhari', 'Mukteshwar'] },
      { name: 'Pauri Garhwal', villages: ['Pauri', 'Kotdwar', 'Srinagar', 'Lansdowne', 'Satpuli', 'Dugadda', 'Bironkhal', 'Dhumakot', 'Ekeshwar', 'Yamkeshwar'] },
      { name: 'Tehri Garhwal', villages: ['Tehri', 'Narendra Nagar', 'Pratapnagar', 'Chamba', 'Devprayag', 'Ghansali', 'Kirti Nagar', 'Lambgaon', 'Thatyur', 'Jakhnidhar'] },
    ]
  },
  {
    name: 'Uttar Pradesh', code: 'UP',
    districts: [
      { name: 'Lucknow', villages: ['Lucknow City', 'Chinhat', 'Bakshi Ka Talab', 'Sarojini Nagar', 'Mohanlalganj', 'Malihabad', 'Kakori', 'Gosainganj', 'Itaunja', 'Banthra'] },
      { name: 'Agra', villages: ['Agra City', 'Firozabad', 'Fatehabad', 'Kheragarh', 'Akola', 'Bah', 'Etmadpur', 'Kiraoli', 'Samsabad', 'Jagner'] },
      { name: 'Varanasi', villages: ['Varanasi City', 'Sarnath', 'Ramnagar', 'Cholapur', 'Arajiline', 'Pindra', 'Seva Puri', 'Kashi Vidyapeeth', 'Harhua', 'Baragaon'] },
      { name: 'Prayagraj', villages: ['Prayagraj City', 'Phulpur', 'Handia', 'Meja', 'Karchhana', 'Soraon', 'Koraon', 'Bara', 'Pratappur', 'Saidabad'] },
      { name: 'Meerut', villages: ['Meerut City', 'Hapur', 'Modinagar', 'Pilkhuwa', 'Ghaziabad', 'Dasna', 'Muradnagar', 'Loni', 'Bhojpur', 'Machhara'] },
    ]
  },
  {
    name: 'Rajasthan', code: 'RJ',
    districts: [
      { name: 'Jaipur', villages: ['Jaipur City', 'Amer', 'Sanganer', 'Bassi', 'Chomu', 'Phagi', 'Jamwa Ramgarh', 'Shahpura', 'Viratnagar', 'Sambhar'] },
      { name: 'Jodhpur', villages: ['Jodhpur City', 'Phalodi', 'Bhopalgarh', 'Shergarh', 'Osian', 'Bilara', 'Balesar', 'Bap', 'Baap', 'Lohawat'] },
      { name: 'Udaipur', villages: ['Udaipur City', 'Nathdwara', 'Rajsamand', 'Kankroli', 'Bhilwara', 'Salumbar', 'Girwa', 'Kherwara', 'Kotra', 'Gogunda'] },
      { name: 'Alwar', villages: ['Alwar City', 'Bharatpur', 'Ramgarh', 'Behror', 'Khairtal', 'Rajgarh', 'Thanagazi', 'Kishangarh Bas', 'Mundawar', 'Laxmangarh'] },
    ]
  },
  {
    name: 'Madhya Pradesh', code: 'MP',
    districts: [
      { name: 'Bhopal', villages: ['Bhopal City', 'Berasia', 'Phanda', 'Huzur', 'Ratibad', 'Kolar', 'Mandideep', 'Obedullaganj', 'Sehore', 'Vidisha'] },
      { name: 'Indore', villages: ['Indore City', 'Depalpur', 'Sanwer', 'Mhow', 'Hatod', 'Gautampura', 'Simrol', 'Palda', 'Limbodi', 'Betma'] },
      { name: 'Jabalpur', villages: ['Jabalpur City', 'Patan', 'Sihora', 'Panagar', 'Katni', 'Barela', 'Kundam', 'Majholi', 'Shahpura', 'Bhedaghat'] },
      { name: 'Gwalior', villages: ['Gwalior City', 'Morar', 'Lashkar', 'Bhitarwar', 'Dabra', 'Pichhore', 'Seondha', 'Bhander', 'Murar', 'Antri'] },
    ]
  },
  {
    name: 'Maharashtra', code: 'MH',
    districts: [
      { name: 'Mumbai', villages: ['Mumbai City', 'Andheri', 'Borivali', 'Kurla', 'Thane', 'Mulund', 'Kandivali', 'Malad', 'Goregaon', 'Vikhroli'] },
      { name: 'Pune', villages: ['Pune City', 'Pimpri', 'Chinchwad', 'Hadapsar', 'Kothrud', 'Wagholi', 'Talegaon', 'Lonavala', 'Khed', 'Junnar'] },
      { name: 'Nagpur', villages: ['Nagpur City', 'Kamptee', 'Hingna', 'Narkhed', 'Katol', 'Savner', 'Parseoni', 'Mouda', 'Kalmeshwar', 'Ramtek'] },
      { name: 'Nashik', villages: ['Nashik City', 'Igatpuri', 'Dindori', 'Peint', 'Baglan', 'Kalwan', 'Nandgaon', 'Malegaon', 'Chandwad', 'Niphad'] },
    ]
  },
  {
    name: 'Gujarat', code: 'GJ',
    districts: [
      { name: 'Ahmedabad', villages: ['Ahmedabad City', 'Dholka', 'Dhandhuka', 'Sanand', 'Viramgam', 'Bavla', 'Detroj Rampura', 'Mandal', 'Ranpur', 'Dascroi'] },
      { name: 'Surat', villages: ['Surat City', 'Bardoli', 'Mandvi', 'Mahuva', 'Vyara', 'Nizar', 'Olpad', 'Kamrej', 'Palsana', 'Mangrol'] },
      { name: 'Vadodara', villages: ['Vadodara City', 'Dabhoi', 'Vadali', 'Karjan', 'Shinkh', 'Sankheda', 'Waghodia', 'Padra', 'Savli', 'Desar'] },
    ]
  },
  {
    name: 'Punjab', code: 'PB',
    districts: [
      { name: 'Amritsar', villages: ['Amritsar City', 'Jandiala', 'Ajnala', 'Baba Bakala', 'Majitha', 'Rayya', 'Tarsikka', 'Mehta', 'Attari', 'Gharinda'] },
      { name: 'Ludhiana', villages: ['Ludhiana City', 'Khanna', 'Raikot', 'Samrala', 'Sahnewal', 'Jagraon', 'Machhiwara', 'Payal', 'Dehlon', 'Mullanpur'] },
      { name: 'Jalandhar', villages: ['Jalandhar City', 'Phagwara', 'Nakodar', 'Shahkot', 'Phillaur', 'Lohian', 'Kartarpur', 'Nurmahal', 'Adampur', 'Bhogpur'] },
    ]
  },
  {
    name: 'Haryana', code: 'HR',
    districts: [
      { name: 'Gurugram', villages: ['Gurugram City', 'Sohna', 'Pataudi', 'Farukhnagar', 'Wazirabad', 'Firozpur Jhirka', 'Nuh', 'Punhana', 'Taoru', 'Kherki Daula'] },
      { name: 'Faridabad', villages: ['Faridabad City', 'Ballabgarh', 'Palwal', 'Hodal', 'Prithla', 'Hathin', 'Sohna', 'Tigaon', 'Badarpur', 'Mewat'] },
      { name: 'Hisar', villages: ['Hisar City', 'Hansi', 'Adampur', 'Uklana', 'Barwala', 'Narnaund', 'Agroha', 'Balsmand', 'Bhattu', 'Tohana'] },
    ]
  },
  {
    name: 'Bihar', code: 'BR',
    districts: [
      { name: 'Patna', villages: ['Patna City', 'Danapur', 'Phulwari Sharif', 'Fatuha', 'Barh', 'Mokameh', 'Bakhtiyarpur', 'Athmalgola', 'Naubatpur', 'Bihta'] },
      { name: 'Gaya', villages: ['Gaya City', 'Bodh Gaya', 'Sherghati', 'Jehanabad', 'Arwal', 'Atri', 'Bodhgaya', 'Gurua', 'Imamganj', 'Tikari'] },
      { name: 'Muzaffarpur', villages: ['Muzaffarpur City', 'Sitamarhi', 'Sheohar', 'Bandh', 'Bochaha', 'Minapur', 'Aurai', 'Sahebganj', 'Kanti', 'Muraul'] },
    ]
  },
  {
    name: 'West Bengal', code: 'WB',
    districts: [
      { name: 'Kolkata', villages: ['Kolkata City', 'Howrah', 'Dum Dum', 'Barrackpore', 'Bally', 'Serampore', 'Bhatpara', 'Kamarhati', 'Panihati', 'Naihati'] },
      { name: 'Hooghly', villages: ['Chinsurah', 'Chandernagore', 'Uttarpara', 'Srirampur', 'Bhadreswar', 'Champdani', 'Tarakeswar', 'Goghat', 'Arambag', 'Dhaniakhali'] },
      { name: 'North 24 Parganas', villages: ['Barasat', 'Basirhat', 'Habra', 'Ashokenagar', 'Gaighata', 'Sandeshkhali', 'Deganga', 'Baduria', 'Swarupnagar', 'Amdanga'] },
    ]
  },
];

const seedLocations = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing
    await State.deleteMany({});
    await District.deleteMany({});
    await Village.deleteMany({});
    console.log('🗑️ Cleared existing location data');

    let stateCount = 0, districtCount = 0, villageCount = 0;

    for (const stateData of locationData) {
      const state = await State.create({ name: stateData.name, code: stateData.code });
      stateCount++;

      for (const districtData of stateData.districts) {
        const district = await District.create({ name: districtData.name, state: state._id });
        districtCount++;

        const villages = districtData.villages.map(v => ({
          name: v,
          district: district._id,
          state: state._id,
        }));
        await Village.insertMany(villages);
        villageCount += villages.length;
      }
    }

    console.log(`✅ Seeded: ${stateCount} states, ${districtCount} districts, ${villageCount} villages`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedLocations();
