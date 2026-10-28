import mongoose from 'mongoose';

async function fix() {
  await mongoose.connect('mongodb://127.0.0.1:27017/campusgig');
  const services = await mongoose.connection.collection('services').find({}).toArray();
  for (const service of services) {
    if (service.portfolioAssets && service.portfolioAssets.length > 0) {
      const updated = service.portfolioAssets.map(a => {
        const isPdf =
          a.fileType === 'pdf' ||
          a.name?.toLowerCase().endsWith('.pdf') ||
          a.url?.includes('application/pdf');
        return {
          ...a,
          fileType: isPdf ? 'pdf' : 'image',
        };
      });
      await mongoose.connection.collection('services').updateOne(
        { _id: service._id },
        { $set: { portfolioAssets: updated } }
      );
      console.log(`Updated service "${service.title}" (${service._id})`);
    }
  }
  await mongoose.disconnect();
}

fix().catch(err => {
  console.error(err);
  process.exit(1);
});
