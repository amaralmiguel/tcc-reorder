package ft.unicamp.apihybridsort;

import com.fasterxml.jackson.databind.JsonNode;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import br.unicamp.ft.mra.reordering.classifier.ClassifierAPI;

@SpringBootApplication
@RestController
@RequestMapping("/classifier")
public class ApiHybridSortApplication extends SpringBootServletInitializer{

	public static void main(String[] args) {
		SpringApplication.run(ApiHybridSortApplication.class, args);
	}

	@CrossOrigin
	@PostMapping
	public String classifier(@RequestBody JsonNode request) throws Exception {
		String pattern = "";
		int numRows = request.get("matrix").size();
		int numCols = request.get("matrix").get(0).size();
		int[] rowPerm = new int[numRows];
		int[] colPerm = new int[numCols];
		double[][] originalMatrix = new double[numRows][numCols];
		ClassifierAPI Classifier = new ClassifierAPI();

		for (int i = 0; i < numRows; i++) {
			rowPerm[i] = request.get("rowPerm").get(i).intValue();
		}

		for (int j = 0; j < numCols; j++) {
			colPerm[j] = request.get("colPerm").get(j).intValue();
		}

		for (int i = 0; i < numRows; i++) {
			for (int j = 0; j < numCols; j++) {
				originalMatrix[i][j] = request.get("matrix").get(i).get(j).doubleValue();
			}
		}

		pattern = Classifier.ClassifierDefaultLabels(originalMatrix, rowPerm, colPerm);
		return pattern;
	}

	@GetMapping
	public String get() {
		return "API Hybrid Sort";
	}
}
