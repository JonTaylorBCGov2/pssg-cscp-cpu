// <auto-generated>
// Code generated by Microsoft (R) AutoRest Code Generator.
// Changes may cause incorrect behavior and will be lost if the code is
// regenerated.
// </auto-generated>

namespace Gov.Jag.VictimServices.Interfaces.Models
{
    using Newtonsoft.Json;
    using System.Linq;

    /// <summary>
    /// msdyn_account_knowledgearticle
    /// </summary>
    public partial class MicrosoftDynamicsCRMmsdynAccountKnowledgearticle
    {
        /// <summary>
        /// Initializes a new instance of the
        /// MicrosoftDynamicsCRMmsdynAccountKnowledgearticle class.
        /// </summary>
        public MicrosoftDynamicsCRMmsdynAccountKnowledgearticle()
        {
            CustomInit();
        }

        /// <summary>
        /// Initializes a new instance of the
        /// MicrosoftDynamicsCRMmsdynAccountKnowledgearticle class.
        /// </summary>
        public MicrosoftDynamicsCRMmsdynAccountKnowledgearticle(string msdynAccountKnowledgearticleid = default(string), string accountid = default(string), string knowledgearticleid = default(string), long? versionnumber = default(long?))
        {
            MsdynAccountKnowledgearticleid = msdynAccountKnowledgearticleid;
            Accountid = accountid;
            Knowledgearticleid = knowledgearticleid;
            Versionnumber = versionnumber;
            CustomInit();
        }

        /// <summary>
        /// An initialization method that performs custom operations like setting defaults
        /// </summary>
        partial void CustomInit();

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "msdyn_account_knowledgearticleid")]
        public string MsdynAccountKnowledgearticleid { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "accountid")]
        public string Accountid { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "knowledgearticleid")]
        public string Knowledgearticleid { get; set; }

        /// <summary>
        /// </summary>
        [JsonProperty(PropertyName = "versionnumber")]
        public long? Versionnumber { get; set; }

    }
}