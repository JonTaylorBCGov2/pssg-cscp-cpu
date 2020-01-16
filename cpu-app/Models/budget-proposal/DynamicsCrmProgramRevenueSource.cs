using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Gov.Cscp.VictimServices.Public.Models
{
	public class DynamicsCrmProgramRevenueSource
	{
		public string fortunecookietype { get { return "#Microsoft.Dynamics.CRM.vsd_programrevenuesource"; } }
		public string vsd_ProgramIdfortunecookiebind
		{
			get
			{
				if (vsd_ProgramIdfortunecookiebind != null)
				{
					return "/vsd_programs(" + vsd_ProgramIdfortunecookiebind + ")";
				}
				else
				{
					return null;
				}
			}
			set { vsd_ProgramIdfortunecookiebind = value; }
		}
		public string vsd_programrevenuesourceid { get; set; }
		public int vsd_cpu_revenuesourcetype { get; set; }
		public float vsd_cashcontribution { get; set; }
		public float vsd_inkindcontribution { get; set; }
		// actual values expected
		// "vsd_ProgramIdfortunecookiebind": "0e309304-c4e6-e911-b811-00505683fbf4"
		// "vsd_programrevenuesourceid": "af5e893e-2bf4-e911-b811-00505683fbf4",
		// "vsd_ProgramIdfortunecookiebind": "0e309304-c4e6-e911-b811-00505683fbf4"
		// "vsd_cpu_revenuesourcetype": 100000000,
		// "vsd_cpu_revenuesourcetype": 100000000,
		// "vsd_cashcontribution": 25000.0000,
		// "vsd_cashcontribution": 25000.0000,
		// "vsd_inkindcontribution": 5000.0000,
		// "vsd_inkindcontribution": 5000.0000,

	}
}