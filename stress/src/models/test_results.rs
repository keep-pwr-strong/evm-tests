use std::time::SystemTime;

pub struct TestResults {
    pub successful: usize,
    pub failed: usize,
    pub errors: Vec<String>,
    pub start_time: SystemTime,
    pub end_time: SystemTime,
    pub actual_tps: f64,
}

impl Default for TestResults {
    fn default() -> Self {
        Self {
            successful: 0,
            failed: 0,
            errors: Vec::new(),
            start_time: SystemTime::now(),
            end_time: SystemTime::now(),
            actual_tps: 0.0,
        }
    }
}