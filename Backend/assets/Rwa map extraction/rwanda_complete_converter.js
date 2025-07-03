// Complete Rwanda Administrative Structure CSV to JSON Converter (JavaScript)
// Updated for the complete dataset with all 5 provinces (no cells/ADM4)
// Dependencies: papaparse (for CSV parsing), fs (for file operations)

const Papa = require("papaparse");
const fs = require("fs");

/**
 * Converts complete Rwanda administrative subdivision CSV to hierarchical JSON structure
 * @param {string} csvFilePath - Path to the CSV file
 * @param {string} outputFilePath - Path for the output JSON file
 * @returns {Promise<Object>} - The complete Rwanda administrative structure
 */
async function convertCompleteRwandaCSVToJSON(csvFilePath, outputFilePath) {
  try {
    console.log("📊 Reading complete Rwanda CSV file...");
    const csvContent = fs.readFileSync(csvFilePath, "utf8");

    console.log("🔍 Parsing CSV data...");
    const parsedData = Papa.parse(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      delimitersToGuess: [",", "\t", "|", ";"],
    });

    if (parsedData.errors.length > 0) {
      console.warn("⚠️ CSV parsing warnings:", parsedData.errors);
    }

    console.log("🏗️ Building complete hierarchical structure...");
    const rwandaStructure = createCompleteRwandaAdministrativeStructure(
      parsedData.data
    );

    console.log("💾 Saving complete JSON file...");
    const jsonOutput = JSON.stringify(rwandaStructure, null, 2);
    fs.writeFileSync(outputFilePath, jsonOutput, "utf8");

    console.log("✅ Complete conversion completed successfully!");
    printCompleteSummary(rwandaStructure);

    return rwandaStructure;
  } catch (error) {
    console.error("❌ Error during conversion:", error.message);
    throw error;
  }
}

/**
 * Creates the complete hierarchical administrative structure from CSV data
 * @param {Array} data - Parsed CSV data
 * @returns {Object} - Complete hierarchical Rwanda structure
 */
function createCompleteRwandaAdministrativeStructure(data) {
  const rwanda = {
    country: {
      en: "Rwanda",
      fr: "Rwanda (le)",
      rw: "U Rwanda",
      sw: "Rwanda",
    },
    code: "RW",
    metadata: {
      totalRecords: data.length,
      generatedAt: new Date().toISOString(),
      source: "Rwanda Administrative Subdivisions Complete CSV",
      levels:
        "Country > Province > District > Sector (no cells in this dataset)",
      coverage: "All 5 provinces of Rwanda",
    },
    provinces: {},
  };

  // Process each row to build the hierarchy
  data.forEach((row, index) => {
    try {
      const provinceName = row.ADM1_EN;
      const districtName = row.ADM2_EN;
      const sectorName = row.ADM3_EN;

      // Validate required fields
      if (!provinceName || !districtName || !sectorName) {
        console.warn(`⚠️ Skipping row ${index + 1}: Missing required fields`);
        return;
      }

      // Initialize province if not exists
      if (!rwanda.provinces[provinceName]) {
        rwanda.provinces[provinceName] = {
          names: {
            en: row.ADM1_EN,
            fr: row.ADM1_FR || "Province",
            rw: row.ADM1_RW || "Intara",
          },
          districts: {},
        };
      }

      // Initialize district if not exists
      if (!rwanda.provinces[provinceName].districts[districtName]) {
        rwanda.provinces[provinceName].districts[districtName] = {
          names: {
            en: districtName,
            fr: districtName, // Use actual district name since ADM2_FR is not available
            rw: districtName, // Use actual district name since ADM2_RW is not available
          },
          sectors: [],
        };
      }

      // Add sector if not already exists
      const sectors =
        rwanda.provinces[provinceName].districts[districtName].sectors;
      if (!sectors.find((sector) => sector.en === sectorName)) {
        sectors.push({
          en: sectorName,
          fr: sectorName, // Use actual sector name since ADM3_FR is not available
          rw: sectorName, // Use actual sector name since ADM3_RW is not available
        });
      }
    } catch (error) {
      console.warn(`⚠️ Error processing row ${index + 1}:`, error.message);
    }
  });

  return rwanda;
}

/**
 * Prints a comprehensive summary of the complete administrative structure
 * @param {Object} structure - The complete Rwanda administrative structure
 */
function printCompleteSummary(structure) {
  console.log("\n📋 COMPLETE RWANDA CONVERSION SUMMARY");
  console.log("=".repeat(70));
  console.log(`🌍 Country: ${structure.country.en}`);
  console.log(`📊 Total Provinces: ${Object.keys(structure.provinces).length}`);

  let totalDistricts = 0;
  let totalSectors = 0;

  // Provincial breakdown
  console.log("\n🗺️ PROVINCIAL BREAKDOWN:");
  Object.keys(structure.provinces).forEach((provinceName) => {
    const province = structure.provinces[provinceName];
    const districtCount = Object.keys(province.districts).length;
    let sectorCount = 0;

    Object.values(province.districts).forEach((district) => {
      sectorCount += district.sectors.length;
    });

    totalDistricts += districtCount;
    totalSectors += sectorCount;

    console.log(`📍 ${provinceName}:`);
    console.log(`   🏛️ Districts: ${districtCount}`);
    console.log(`   🏘️ Sectors: ${sectorCount}`);
    console.log(
      `   🌐 Names: EN:"${province.names.en}" | FR:"${province.names.fr}" | RW:"${province.names.rw}"`
    );
    console.log("   " + "-".repeat(50));
  });

  console.log("\n📊 NATIONAL TOTALS:");
  console.log(`   🏛️ Provinces: ${Object.keys(structure.provinces).length}`);
  console.log(`   🏢 Districts: ${totalDistricts}`);
  console.log(`   🏘️ Sectors: ${totalSectors}`);
  console.log(`   📄 Records: ${structure.metadata.totalRecords}`);
  console.log("=".repeat(70));

  // Coverage verification
  const expectedProvinces = [
    "Kigali City",
    "Southern Province",
    "Western Province",
    "Northern Province",
    "Eastern Province",
  ];
  const actualProvinces = Object.keys(structure.provinces);
  const missingProvinces = expectedProvinces.filter(
    (p) => !actualProvinces.includes(p)
  );

  console.log("\n✅ COVERAGE VERIFICATION:");
  if (missingProvinces.length === 0) {
    console.log("🎯 Complete coverage: All 5 provinces included!");
  } else {
    console.log("⚠️ Missing provinces:", missingProvinces);
  }
}

/**
 * Gets comprehensive statistics about the complete structure
 * @param {Object} structure - The complete Rwanda administrative structure
 * @returns {Object} - Detailed statistics object
 */
function getCompleteStructureStats(structure) {
  const stats = {
    provinces: Object.keys(structure.provinces).length,
    districts: 0,
    sectors: 0,
    coverage: {},
    byProvince: {},
    ranking: {
      byDistricts: [],
      bySectors: [],
    },
  };

  const provinceStats = [];

  Object.keys(structure.provinces).forEach((provinceName) => {
    const province = structure.provinces[provinceName];
    const districtCount = Object.keys(province.districts).length;
    let sectorCount = 0;

    Object.values(province.districts).forEach((district) => {
      sectorCount += district.sectors.length;
    });

    stats.districts += districtCount;
    stats.sectors += sectorCount;

    const provinceData = {
      name: provinceName,
      districts: districtCount,
      sectors: sectorCount,
      names: province.names,
    };

    provinceStats.push(provinceData);
    stats.byProvince[provinceName] = provinceData;
  });

  // Create rankings
  stats.ranking.byDistricts = [...provinceStats].sort(
    (a, b) => b.districts - a.districts
  );
  stats.ranking.bySectors = [...provinceStats].sort(
    (a, b) => b.sectors - a.sectors
  );

  // Calculate coverage percentages
  stats.coverage.sectorPercentages = {};
  provinceStats.forEach((province) => {
    stats.coverage.sectorPercentages[province.name] =
      ((province.sectors / stats.sectors) * 100).toFixed(1) + "%";
  });

  return stats;
}

/**
 * Search function for administrative units in the complete structure
 * @param {Object} structure - The complete Rwanda administrative structure
 * @param {string} searchTerm - Term to search for
 * @param {string} unitType - Type of unit ("province", "district", "sector", "all")
 * @returns {Array} - Array of matching results with full paths
 */
function searchAdministrativeUnits(structure, searchTerm, unitType = "all") {
  const results = [];
  const search = searchTerm.toLowerCase();

  Object.keys(structure.provinces).forEach((provinceName) => {
    const province = structure.provinces[provinceName];

    // Search provinces
    if (
      (unitType === "province" || unitType === "all") &&
      (provinceName.toLowerCase().includes(search) ||
        province.names.fr.toLowerCase().includes(search) ||
        province.names.rw.toLowerCase().includes(search))
    ) {
      results.push({
        type: "province",
        name: provinceName,
        path: [provinceName],
        names: province.names,
        stats: {
          districts: Object.keys(province.districts).length,
          sectors: Object.values(province.districts).reduce(
            (sum, d) => sum + d.sectors.length,
            0
          ),
        },
      });
    }

    Object.keys(province.districts).forEach((districtName) => {
      const district = province.districts[districtName];

      // Search districts
      if (
        (unitType === "district" || unitType === "all") &&
        districtName.toLowerCase().includes(search)
      ) {
        results.push({
          type: "district",
          name: districtName,
          path: [provinceName, districtName],
          names: district.names,
          stats: {
            sectors: district.sectors.length,
          },
        });
      }

      // Search sectors
      district.sectors.forEach((sector) => {
        if (
          (unitType === "sector" || unitType === "all") &&
          sector.en.toLowerCase().includes(search)
        ) {
          results.push({
            type: "sector",
            name: sector.en,
            path: [provinceName, districtName, sector.en],
            names: sector,
          });
        }
      });
    });
  });

  return results;
}

/**
 * Validates the complete administrative structure
 * @param {Object} structure - The complete Rwanda administrative structure
 * @returns {Object} - Validation report
 */
function validateCompleteStructure(structure) {
  const report = {
    valid: true,
    errors: [],
    warnings: [],
    statistics: {},
    coverage: {
      expectedProvinces: 5,
      actualProvinces: 0,
      complete: false,
    },
  };

  try {
    // Check required top-level keys
    const requiredKeys = ["country", "code", "provinces", "metadata"];
    requiredKeys.forEach((key) => {
      if (!(key in structure)) {
        report.errors.push(`Missing required key: ${key}`);
        report.valid = false;
      }
    });

    // Validate provinces
    if ("provinces" in structure) {
      const provinces = Object.keys(structure.provinces);
      report.coverage.actualProvinces = provinces.length;
      report.coverage.complete = provinces.length === 5;

      const expectedProvinces = [
        "Kigali City",
        "Southern Province",
        "Western Province",
        "Northern Province",
        "Eastern Province",
      ];
      const missingProvinces = expectedProvinces.filter(
        (p) => !provinces.includes(p)
      );

      if (missingProvinces.length > 0) {
        report.warnings.push(
          `Missing provinces: ${missingProvinces.join(", ")}`
        );
      }

      // Validate structure integrity
      provinces.forEach((provinceName) => {
        const province = structure.provinces[provinceName];
        if (!province.districts) {
          report.errors.push(`Province ${provinceName} missing districts`);
          report.valid = false;
        } else {
          Object.keys(province.districts).forEach((districtName) => {
            const district = province.districts[districtName];
            if (!Array.isArray(district.sectors)) {
              report.errors.push(
                `District ${districtName} sectors should be an array`
              );
              report.valid = false;
            }
          });
        }
      });
    }

    // Get statistics
    report.statistics = getCompleteStructureStats(structure);
  } catch (error) {
    report.errors.push(`Validation error: ${error.message}`);
    report.valid = false;
  }

  return report;
}

// Example usage and main function
async function main() {
  try {
    const inputFile = "Rwa map New sumary.csv";
    const outputFile = "rwanda_complete_administrative_structure.json";

    console.log("🚀 Starting complete Rwanda administrative conversion...");
    const result = await convertCompleteRwandaCSVToJSON(inputFile, outputFile);

    // Get comprehensive statistics
    const stats = getCompleteStructureStats(result);
    console.log("\n📊 Comprehensive Statistics:");
    console.log(
      "Total administrative units:",
      stats.provinces + stats.districts + stats.sectors
    );

    // Show rankings
    console.log("\n🏆 Province Rankings by Sectors:");
    stats.ranking.bySectors.forEach((province, index) => {
      console.log(
        `${index + 1}. ${province.name}: ${province.sectors} sectors (${
          stats.coverage.sectorPercentages[province.name]
        })`
      );
    });

    // Validate structure
    console.log("\n🔍 Validating structure...");
    const validation = validateCompleteStructure(result);
    console.log(`✅ Structure valid: ${validation.valid}`);
    console.log(`📊 Coverage complete: ${validation.coverage.complete}`);

    if (validation.errors.length > 0) {
      console.log("❌ Errors:", validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.log("⚠️ Warnings:", validation.warnings);
    }

    // Demo search functionality
    console.log("\n🔍 Search Demo:");
    const searchResults = searchAdministrativeUnits(result, "kigali", "all");
    console.log(
      `Found ${searchResults.length} matches for "kigali":`,
      searchResults.map((r) => `${r.type}: ${r.name}`)
    );
  } catch (error) {
    console.error("❌ Script failed:", error.message);
    process.exit(1);
  }
}

// Utility function for generating reports
function generateAdministrativeReport(structure) {
  const stats = getCompleteStructureStats(structure);

  const report = {
    title: "Rwanda Complete Administrative Structure Report",
    generatedAt: new Date().toISOString(),
    summary: {
      totalProvinces: stats.provinces,
      totalDistricts: stats.districts,
      totalSectors: stats.sectors,
      coverage: "All 5 provinces of Rwanda",
    },
    provinces: stats.byProvince,
    rankings: stats.ranking,
    distribution: stats.coverage.sectorPercentages,
  };

  return report;
}

// Export functions for use as a module
module.exports = {
  convertCompleteRwandaCSVToJSON,
  createCompleteRwandaAdministrativeStructure,
  getCompleteStructureStats,
  searchAdministrativeUnits,
  validateCompleteStructure,
  generateAdministrativeReport,
  printCompleteSummary,
};

// Run the converter if this file is executed directly
if (require.main === module) {
  main();
}

/* 
=== USAGE EXAMPLES ===

1. Basic Command Line Usage:
   node rwanda_complete_converter.js

2. Custom file paths:
   // Modify inputFile and outputFile variables in main() function

3. Programmatic Usage:
   const { convertCompleteRwandaCSVToJSON } = require('./rwanda_complete_converter');
   const result = await convertCompleteRwandaCSVToJSON('input.csv', 'output.json');

4. Search functionality:
   const { searchAdministrativeUnits } = require('./rwanda_complete_converter');
   const results = searchAdministrativeUnits(structure, "nyarugenge", "district");

5. Generate reports:
   const { generateAdministrativeReport } = require('./rwanda_complete_converter');
   const report = generateAdministrativeReport(structure);
   console.log(JSON.stringify(report, null, 2));

6. Validate structure:
   const { validateCompleteStructure } = require('./rwanda_complete_converter');
   const validation = validateCompleteStructure(structure);
   if (!validation.valid) {
       console.error('Structure validation failed:', validation.errors);
   }

=== INSTALLATION ===
1. Install Node.js dependencies:
   npm install papaparse

2. Place your CSV file as 'Rwa map New sumary.csv' in the same directory

3. Run the script:
   node rwanda_complete_converter.js

4. Output will be saved as 'rwanda_complete_administrative_structure.json'

=== KEY DIFFERENCES FROM PREVIOUS VERSION ===
- Handles all 5 provinces instead of 3
- Sectors stored as arrays instead of objects with cells
- No ADM4 (cells) level - goes only to ADM3 (sectors)
- Enhanced validation for complete coverage
- Better multilingual name handling
- Comprehensive statistics and ranking system
- Improved search functionality across all levels
*/
