const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });
const infoController = require("../controllers/infoController");

// Mock request, response, next
const mockReq = {
  query: {
    page: 1,
    limit: 10,
  },
  params: {},
  body: {},
};

const mockRes = {
  success: function (data, statusCode) {
    console.log("✅ Success Response:");
    console.log(JSON.stringify(data, null, 2));
  },
  error: function (message, statusCode) {
    console.log("❌ Error Response:");
    console.log({ message, statusCode });
  },
};

const mockNext = function (error) {
  console.log("❌ Error passed to next:");
  console.log(error);
};

async function testController() {
  try {
    console.log("Testing getAllInfo controller...\n");
    await infoController.getAllInfo(mockReq, mockRes, mockNext);
    console.log("\n✅ Controller test completed!");
  } catch (error) {
    console.error("❌ Controller test failed:", error);
  } finally {
    process.exit(0);
  }
}

testController();
