const { getWriterIncomeReport } = require('../services/incomeService');

// เขียนแบบนี้แทนการประกาศ const
exports.getMyIncome = async (req, res) => {
  try {
    const writerId = req.user.id;
    const report = await getWriterIncomeReport(writerId);
    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};