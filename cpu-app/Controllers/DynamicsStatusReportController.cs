using Gov.Cscp.Victims.Public.Models;
using Gov.Cscp.Victims.Public.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Threading.Tasks;

namespace Gov.Cscp.Victims.Public.Controllers
{
	[Route("api/[controller]")]
	[Authorize]
	public class DynamicsStatusReportController : Controller
	{
		private readonly IDynamicsResultService _dynamicsResultService;

		public DynamicsStatusReportController(IDynamicsResultService dynamicsResultService)
		{
			this._dynamicsResultService = dynamicsResultService;
		}

		[HttpGet("{businessBceid}/{userBceid}/{programId}")]
		public async Task<IActionResult> GetQuestions(string businessBceid, string userBceid, string programId)
		{
			try
			{
				// convert the parameters to a json string
				string requestJson = "{\"UserBCeID\":\"" + userBceid + "\",\"BusinessBCeID\":\"" + businessBceid + "\"}";
				// set the endpoint action
				string endpointUrl = "vsd_programs(" + programId + ")/Microsoft.Dynamics.CRM.vsd_GetCPUMonthlyStatisticsQuestions";

				// get the response
				DynamicsResult result = await _dynamicsResultService.GetResultAsync(endpointUrl, requestJson);

				return StatusCode(200, result.result.ToString());
			}
			finally { }
		}
		[HttpPost("{programId}")]
		public async Task<IActionResult> AnswerQuestions([FromBody] MonthlyStatisticsAnswers model, string programId)
		{
			try
			{
				string endpointUrl = "vsd_programs(" + programId + ")/Microsoft.Dynamics.CRM.vsd_SetCPUMonthlyStatisticsAnswers";
				// make options for the json serializer
				JsonSerializerOptions options = new JsonSerializerOptions();
				options.IgnoreNullValues = true;
				// turn the model into a string
				string modelString = System.Text.Json.JsonSerializer.Serialize(model, options);
				DynamicsResult result = await _dynamicsResultService.SetDataAsync(endpointUrl, modelString);

				return StatusCode((int)result.statusCode, result.result.ToString());
			}
			finally { }
		}
	}
}