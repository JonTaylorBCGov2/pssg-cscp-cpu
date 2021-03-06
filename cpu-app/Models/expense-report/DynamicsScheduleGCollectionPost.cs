using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Gov.Cscp.Victims.Public.Models
{
    public class DynamicsScheduleGCollectionPost
    {
        public float vsd_actualhoursthisquarter { get; set; }
        public float vsd_contractedservicehrsthisquarter { get; set; }
        // public float vsd_cpu_numberofhours { get; set; }
        public float vsd_programadministrationcurrentquarter { get; set; }
        public float vsd_programdeliverycurrentquarter { get; set; }
        public float vsd_salariesbenefitscurrentquarter { get; set; }
        public string fortunecookietype { get { return "Microsoft.Dynamics.CRM.vsd_scheduleg"; } }
        public string vsd_programadministrationexplanation { get; set; }
        public string vsd_programdeliveryexplanations { get; set; }
        public string vsd_salariesandbenefitsexplanation { get; set; }
        public string vsd_schedulegid { get; set; }
        public bool vsd_reportreviewed { get; set; }
    }
}
