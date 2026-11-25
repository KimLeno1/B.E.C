const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

async function createDeployArchive() {
  const outputZipPath = path.resolve(process.cwd(), 'closet-kraze-deploy.zip');
  const legacyZipPath = path.resolve(process.cwd(), 'Archive.zip');

  const output = fs.createWriteStream(outputZipPath);
  const archive = new archiver.ZipArchive({ zlib: { level: 9 } });

  const outputPromise = new Promise((resolve, reject) => {
    output.on('close', () => {
      console.log(`Archive created successfully: ${outputZipPath} (${(archive.pointer() / 1024 / 1024).toFixed(2)} MB)`);
      try {
        fs.copyFileSync(outputZipPath, legacyZipPath);
        console.log(`Legacy Archive.zip updated at: ${legacyZipPath}`);
      } catch (cpErr) {
        console.warn('Could not copy legacy Archive.zip:', cpErr);
      }
      resolve(true);
    });
    output.on('error', reject);
    archive.on('error', reject);
  });

  archive.pipe(output);

  // Files to include in root of zip
  const rootFiles = [
    'schema.sql',
    'app.js',
    'server.cjs',
    'server.ts',
    'tsconfig.json',
    'tsconfig.server.json',
    'index.html',
    '.env.example',
    'DEPLOYMENT.md',
    '.htaccess'
  ];

  for (const file of rootFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      archive.file(fullPath, { name: file });
    }
  }

  // Put the lightweight production package.json as package.json in the zip
  // so npm install on cPanel only installs the 2 required native dependencies (~20MB vs ~500MB)
  const prodPkgPath = path.join(process.cwd(), 'package.production.json');
  if (fs.existsSync(prodPkgPath)) {
    archive.file(prodPkgPath, { name: 'package.json' });
  } else {
    archive.file(path.join(process.cwd(), 'package.json'), { name: 'package.json' });
  }

  // Keep full package.json available as package.full.json
  const fullPkgPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(fullPkgPath)) {
    archive.file(fullPkgPath, { name: 'package.full.json' });
  }

  // Directories to include in zip
  const directories = [
    'dist',
    'dist-server',
    'public',
    'api'
  ];

  for (const dir of directories) {
    const fullDir = path.join(process.cwd(), dir);
    if (fs.existsSync(fullDir)) {
      archive.directory(fullDir, dir);
    }
  }

  await archive.finalize();
  await outputPromise;
}

createDeployArchive().catch(err => {
  console.error('Error creating deploy archive:', err);
  process.exit(1);
});
